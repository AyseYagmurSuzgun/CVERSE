using System;

namespace Cverse.Domain.Entities
{
    public class CommentLike
    {
        public Guid Id { get; set; }
        public Guid CommentId { get; set; }
        public Guid UserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Comment Comment { get; set; } = null!;
        public ApplicationUser User { get; set; } = null!;
    }
}
