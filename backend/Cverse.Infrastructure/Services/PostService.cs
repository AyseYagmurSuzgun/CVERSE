using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Cverse.Application.DTOs;
using Cverse.Application.Interfaces;
using Cverse.Domain.Entities;
using Cverse.Persistence;
using Cverse.Persistence.Context; 
using Microsoft.AspNetCore.SignalR;
using Cverse.Infrastructure.SignalR;

namespace Cverse.Infrastructure.Services
{
    public class PostService : IPostService
    {
        private readonly AppDbContext _context;
        private readonly IFileService _fileService;
        private readonly INotificationService _notificationService;
        private readonly IHubContext<FeedHub> _feedHubContext;

        public PostService(
            AppDbContext context, 
            IFileService fileService,
            INotificationService notificationService,
            IHubContext<FeedHub> feedHubContext)
        {
            _context = context;
            _fileService = fileService;
            _notificationService = notificationService;
            _feedHubContext = feedHubContext;
        }

        public async Task<PostDto> CreatePostAsync(Guid userId, CreatePostDto dto)
        {
            var post = new Post
            {
                UserId = userId,
                Content = dto.Content,
                CreatedAt = DateTime.UtcNow
            };

            if (dto.Images != null && dto.Images.Any())
            {
                foreach (var file in dto.Images)
                {
                    var imageUrl = await _fileService.UploadImageAsync(file, "posts");
                    post.Images.Add(new PostImage { ImageUrl = imageUrl });
                }
            }

            _context.Set<Post>().Add(post);
            await _context.SaveChangesAsync();

            var savedPost = await _context.Set<Post>()
                .Include(p => p.User).ThenInclude(u => u.Profile)
                .Include(p => p.Images)
                .Include(p => p.Likes)
                .Include(p => p.Comments).ThenInclude(c => c.User).ThenInclude(u => u.Profile)
                .Include(p => p.Comments).ThenInclude(c => c.Likes)
                .Include(p => p.Reposts)
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == post.Id);

            var postDto = MapToDto(savedPost!, userId);

            // Broadcast the new post to all active feed subscribers
            await _feedHubContext.Clients.All.SendAsync("OnNewPostReceived", postDto);

            return postDto;
        }

        public async Task<IEnumerable<PostDto>> GetFeedAsync(Guid currentUserId)
        {
            var posts = await _context.Set<Post>()
                .Include(p => p.User).ThenInclude(u => u.Profile)
                .Include(p => p.Images)
                .Include(p => p.Likes)
                .Include(p => p.Comments).ThenInclude(c => c.User).ThenInclude(u => u.Profile)
                .Include(p => p.Comments).ThenInclude(c => c.Likes)
                .Include(p => p.Reposts)
                .OrderByDescending(p => p.CreatedAt)
                .Take(50)
                .ToListAsync();

            return posts.Select(p => MapToDto(p, currentUserId));
        }

        public async Task<bool> ToggleLikeAsync(Guid userId, Guid postId)
        {
            var existingLike = await _context.Set<Like>().FirstOrDefaultAsync(l => l.PostId == postId && l.UserId == userId);
            bool isLiked;
            if (existingLike != null)
            {
                _context.Set<Like>().Remove(existingLike);
                await _context.SaveChangesAsync();
                isLiked = false;
            }
            else
            {
                _context.Set<Like>().Add(new Like { PostId = postId, UserId = userId });
                await _context.SaveChangesAsync();
                isLiked = true;
            }

            // Get target post to identify author
            var post = await _context.Set<Post>().FindAsync(postId);
            var likeCount = await _context.Set<Like>().CountAsync(l => l.PostId == postId);

            // Broadcast metrics updated
            await _feedHubContext.Clients.All.SendAsync("OnPostMetricsUpdated", postId, "Like", likeCount);

            // Trigger notification
            if (isLiked && post != null && post.UserId != userId)
            {
                var liker = await _context.Users.FindAsync(userId);
                await _notificationService.CreateNotificationAsync(
                    post.UserId, 
                    "Like", 
                    $"{liker?.AdSoyad ?? "Birisi"} gönderinizi beğendi.", 
                    userId
                );
            }

            return isLiked;
        }

        public async Task<CommentDto> AddCommentAsync(Guid userId, Guid postId, string content)
        {
            var comment = new Comment { PostId = postId, UserId = userId, Content = content };
            _context.Set<Comment>().Add(comment);
            await _context.SaveChangesAsync();

            var user = await _context.Set<ApplicationUser>().Include(u => u.Profile).FirstOrDefaultAsync(u => u.Id == userId);

            var commentDto = new CommentDto
            {
                Id = comment.Id,
                PostId = postId,
                UserId = userId,
                AdSoyad = user!.AdSoyad,
                ProfileImage = user.ProfilFotografiUrl,
                Content = content,
                CreatedAt = comment.CreatedAt,
                LikeCount = 0,
                IsLikedByCurrentUser = false
            };

            var post = await _context.Set<Post>().FindAsync(postId);
            var commentCount = await _context.Set<Comment>().CountAsync(c => c.PostId == postId);

            // Broadcast metrics updated
            await _feedHubContext.Clients.All.SendAsync("OnPostMetricsUpdated", postId, "Comment", commentCount);
            await _feedHubContext.Clients.All.SendAsync("OnCommentAdded", commentDto);

            // Trigger notification
            if (post != null && post.UserId != userId)
            {
                await _notificationService.CreateNotificationAsync(
                    post.UserId,
                    "Comment",
                    $"{user.AdSoyad} gönderinize yorum yaptı: \"{(content.Length > 30 ? content.Substring(0, 27) + "..." : content)}\"",
                    userId
                );
            }

            return commentDto;
        }

        public async Task<bool> ToggleRepostAsync(Guid userId, Guid postId)
        {
            var existingRepost = await _context.Set<Repost>().FirstOrDefaultAsync(r => r.PostId == postId && r.UserId == userId);
            bool isReposted;
            if (existingRepost != null)
            {
                _context.Set<Repost>().Remove(existingRepost);
                await _context.SaveChangesAsync();
                isReposted = false;
            }
            else
            {
                _context.Set<Repost>().Add(new Repost { PostId = postId, UserId = userId });
                await _context.SaveChangesAsync();
                isReposted = true;
            }

            var post = await _context.Set<Post>().FindAsync(postId);
            var repostCount = await _context.Set<Repost>().CountAsync(r => r.PostId == postId);

            // Broadcast metrics updated
            await _feedHubContext.Clients.All.SendAsync("OnPostMetricsUpdated", postId, "Repost", repostCount);

            // Trigger notification
            if (isReposted && post != null && post.UserId != userId)
            {
                var reposter = await _context.Users.FindAsync(userId);
                await _notificationService.CreateNotificationAsync(
                    post.UserId,
                    "Repost",
                    $"{reposter?.AdSoyad ?? "Birisi"} gönderinizi yeniden paylaştı.",
                    userId
                );
            }

            return isReposted;
        }

        public async Task<bool> DeletePostAsync(Guid userId, Guid postId)
        {
            var post = await _context.Set<Post>().FirstOrDefaultAsync(p => p.Id == postId);
            if (post == null) return false;

            var user = await _context.Users.FindAsync(userId);
            bool isAdmin = user != null && user.Email == "admin@cverse.com";

            if (post.UserId != userId && !isAdmin) return false;

            _context.Set<Post>().Remove(post);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<PostDto>> GetUserPostsAsync(Guid currentUserId, Guid targetUserId)
        {
            var posts = await _context.Set<Post>()
                .Include(p => p.User).ThenInclude(u => u.Profile)
                .Include(p => p.Images)
                .Include(p => p.Likes)
                .Include(p => p.Comments).ThenInclude(c => c.User).ThenInclude(u => u.Profile)
                .Include(p => p.Comments).ThenInclude(c => c.Likes)
                .Include(p => p.Reposts)
                .Where(p => p.UserId == targetUserId)
                .OrderByDescending(p => p.CreatedAt)
                .Take(50)
                .ToListAsync();

            return posts.Select(p => MapToDto(p, currentUserId));
        }

        private PostDto MapToDto(Post p, Guid currentUserId)
        {
            return new PostDto
            {
                Id = p.Id,
                UserId = p.UserId,
                UserName = p.User.UserName ?? string.Empty,
                AdSoyad = p.User.AdSoyad,
                // EN KRİTİK NOKTA: Kullanıcı ve Profil resimleri canlı/referanslı olarak çekiliyor
                ProfileImage = p.User.ProfilFotografiUrl,
                Unvan = p.User.Profile?.Unvan,
                Content = p.Content,
                CreatedAt = p.CreatedAt,
                Images = p.Images.Select(i => i.ImageUrl).ToList(),
                LikeCount = p.Likes.Count,
                CommentCount = p.Comments.Count,
                RepostCount = p.Reposts.Count,
                IsLikedByCurrentUser = p.Likes.Any(l => l.UserId == currentUserId),
                IsRepostedByCurrentUser = p.Reposts.Any(r => r.UserId == currentUserId),
                RecentComments = p.Comments.OrderByDescending(c => c.CreatedAt).Take(3).Select(c => new CommentDto
                {
                    Id = c.Id, PostId = c.PostId, UserId = c.UserId, 
                    AdSoyad = c.User.AdSoyad, 
                    ProfileImage = c.User.ProfilFotografiUrl,
                    Content = c.Content, CreatedAt = c.CreatedAt,
                    LikeCount = c.Likes != null ? c.Likes.Count : 0,
                    IsLikedByCurrentUser = c.Likes != null && c.Likes.Any(l => l.UserId == currentUserId)
                }).ToList()
            };
        }

        public async Task<bool> ToggleCommentLikeAsync(Guid userId, Guid commentId)
        {
            var existingLike = await _context.Set<CommentLike>()
                .FirstOrDefaultAsync(cl => cl.CommentId == commentId && cl.UserId == userId);

            bool isLiked;
            if (existingLike != null)
            {
                _context.Set<CommentLike>().Remove(existingLike);
                await _context.SaveChangesAsync();
                isLiked = false;
            }
            else
            {
                _context.Set<CommentLike>().Add(new CommentLike { CommentId = commentId, UserId = userId });
                await _context.SaveChangesAsync();
                isLiked = true;
            }

            // Get target comment to identify author
            var comment = await _context.Set<Comment>().Include(c => c.Post).FirstOrDefaultAsync(c => c.Id == commentId);

            // Trigger notification
            if (isLiked && comment != null && comment.UserId != userId)
            {
                var liker = await _context.Users.FindAsync(userId);
                await _notificationService.CreateNotificationAsync(
                    comment.UserId,
                    "Like",
                    $"{liker?.AdSoyad ?? "Birisi"} yorumunuzu beğendi: \"{(comment.Content.Length > 20 ? comment.Content.Substring(0, 17) + "..." : comment.Content)}\"",
                    userId
                );
            }

            // Broadcast comment metrics updated via FeedHub
            var likeCount = await _context.Set<CommentLike>().CountAsync(cl => cl.CommentId == commentId);
            await _feedHubContext.Clients.All.SendAsync("OnCommentMetricsUpdated", commentId, "Like", likeCount);

            return isLiked;
        }
    }
}