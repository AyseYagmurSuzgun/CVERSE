using System;

namespace Cverse.Domain.Entities
{
    public class Follow
    {
        public Guid Id { get; set; }
        public Guid FollowerId { get; set; }
        public Guid FollowedId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public ApplicationUser Follower { get; set; } = null!;
        public ApplicationUser Followed { get; set; } = null!;
    }
}
