using System;

namespace Cverse.Domain.Entities
{
    public class Notification
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Type { get; set; } = null!;
        public string Content { get; set; } = null!;
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Guid? TriggeredById { get; set; }

        // Navigation Properties
        public ApplicationUser User { get; set; } = null!;
        public ApplicationUser? TriggeredBy { get; set; }
    }
}
