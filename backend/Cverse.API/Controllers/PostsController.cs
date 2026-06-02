using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Cverse.Application.DTOs;
using Cverse.Application.Interfaces;

namespace Cverse.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PostsController : BaseApiController
    {
        private readonly IPostService _postService;

        public PostsController(IPostService postService)
        {
            _postService = postService;
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        [HttpPost("create")]
        public async Task<IActionResult> CreatePost([FromForm] CreatePostDto dto)
        {
            var post = await _postService.CreatePostAsync(GetUserId(), dto);
            return Ok(new { Basarili = true, Mesaj = "Gönderi oluşturuldu.", Data = post });
        }

        [HttpGet("feed")]
        public async Task<IActionResult> GetFeed()
        {
            var feed = await _postService.GetFeedAsync(GetUserId());
            return Ok(new { Basarili = true, Mesaj = "Akış başarıyla getirildi.", Data = feed });
        }

        [HttpPost("{id}/like")]
        public async Task<IActionResult> ToggleLike(Guid id)
        {
            var result = await _postService.ToggleLikeAsync(GetUserId(), id);
            return Ok(new { Basarili = true, Mesaj = result ? "Gönderi beğenildi." : "Beğeni kaldırıldı.", Data = result });
        }

        [HttpPost("{id}/comment")]
        public async Task<IActionResult> AddComment(Guid id, [FromBody] CommentRequest request)
        {
            var comment = await _postService.AddCommentAsync(GetUserId(), id, request.Content);
            return Ok(new { Basarili = true, Mesaj = "Yorum eklendi.", Data = comment });
        }

        [HttpPost("comments/{commentId}/like")]
        public async Task<IActionResult> ToggleCommentLike(Guid commentId)
        {
            var result = await _postService.ToggleCommentLikeAsync(GetUserId(), commentId);
            return Ok(new { Basarili = true, Mesaj = result ? "Yorum beğenildi." : "Beğeni kaldırıldı.", Data = result });
        }

        [HttpPost("{id}/repost")]
        public async Task<IActionResult> ToggleRepost(Guid id)
        {
            var result = await _postService.ToggleRepostAsync(GetUserId(), id);
            return Ok(new { Basarili = true, Mesaj = result ? "Yeniden paylaşıldı." : "Yeniden paylaşım geri alındı." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePost(Guid id)
        {
            var result = await _postService.DeletePostAsync(GetUserId(), id);
            if (!result) return BadRequest(new { Basarili = false, Mesaj = "Gönderi silinemedi veya yetkiniz yok." });
            return Ok(new { Basarili = true, Mesaj = "Gönderi başarıyla silindi." });
        }

        [HttpGet("user/{targetUserId}")]
        public async Task<IActionResult> GetUserPosts(Guid targetUserId)
        {
            var posts = await _postService.GetUserPostsAsync(GetUserId(), targetUserId);
            return Ok(new { Basarili = true, Mesaj = "Kullanıcı gönderileri başarıyla getirildi.", Data = posts });
        }
    }
    public class CommentRequest { public string Content { get; set; } = string.Empty; }
}