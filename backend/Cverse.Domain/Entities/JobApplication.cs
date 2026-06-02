using System;

namespace Cverse.Domain.Entities
{
    public class JobApplication
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid JobId { get; set; }
        public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Applied";

        // Navigation properties
        public ApplicationUser User { get; set; } = null!;
        public Job Job { get; set; } = null!;
    }
}
