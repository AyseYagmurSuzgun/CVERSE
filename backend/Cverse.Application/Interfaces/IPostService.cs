using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Cverse.Application.DTOs;

namespace Cverse.Application.Interfaces
{
    public interface IPostService
    {
        Task<PostDto> CreatePostAsync(Guid userId, CreatePostDto dto);
        Task<IEnumerable<PostDto>> GetFeedAsync(Guid currentUserId);
        Task<bool> ToggleLikeAsync(Guid userId, Guid postId);
        Task<CommentDto> AddCommentAsync(Guid userId, Guid postId, string content);
        Task<bool> ToggleRepostAsync(Guid userId, Guid postId);
        Task<bool> DeletePostAsync(Guid userId, Guid postId);
        Task<IEnumerable<PostDto>> GetUserPostsAsync(Guid currentUserId, Guid targetUserId);
        Task<bool> ToggleCommentLikeAsync(Guid userId, Guid commentId);
    }
}