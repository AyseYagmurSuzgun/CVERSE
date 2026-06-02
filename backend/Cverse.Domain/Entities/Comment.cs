using System;

namespace Cverse.Domain.Entities
{
    public class Comment
    {
        public Guid Id { get; set; }
        public Guid PostId { get; set; }
        public Guid UserId { get; set; }
        public string Content { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Post Post { get; set; } = null!;
        public ApplicationUser User { get; set; } = null!;
        public ICollection<CommentLike> Likes { get; set; } = new List<CommentLike>();
    }
}