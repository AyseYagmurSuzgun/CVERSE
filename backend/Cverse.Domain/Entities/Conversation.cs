using System;
using System.Collections.Generic;

namespace Cverse.Domain.Entities
{
    public class Conversation
    {
        public Guid Id { get; set; }
        public Guid User1Id { get; set; }
        public Guid User2Id { get; set; }
        public DateTime LastMessageAt { get; set; } = DateTime.UtcNow;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public ApplicationUser User1 { get; set; } = null!;
        public ApplicationUser User2 { get; set; } = null!;
        public ICollection<Message> Messages { get; set; } = new List<Message>();
    }
}
