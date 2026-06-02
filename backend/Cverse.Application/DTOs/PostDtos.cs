using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace Cverse.Application.DTOs
{
    public class CreatePostDto
    {
        public string? Content { get; set; }
        public List<IFormFile>? Images { get; set; }
    }

    public class PostDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; } = null!;
        public string AdSoyad { get; set; } = null!;
        public string? ProfileImage { get; set; } // Canlı Çekilecek
        public string? Unvan { get; set; } // Canlı Çekilecek
        public string? Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<string> Images { get; set; } = new();
        public int LikeCount { get; set; }
        public int CommentCount { get; set; }
        public int RepostCount { get; set; }
        public bool IsLikedByCurrentUser { get; set; }
        public bool IsRepostedByCurrentUser { get; set; }
        public List<CommentDto> RecentComments { get; set; } = new();
    }

    public class CommentDto
    {
        public Guid Id { get; set; }
        public Guid PostId { get; set; }
        public Guid UserId { get; set; }
        public string AdSoyad { get; set; } = null!;
        public string? ProfileImage { get; set; }
        public string Content { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public int LikeCount { get; set; }
        public bool IsLikedByCurrentUser { get; set; }
    }
}