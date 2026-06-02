using System;

namespace Cverse.Domain.Entities
{
    public class Skill
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string YetenekAdi { get; set; } = null!;
        public DateTime OlusturmaTarihi { get; set; } = DateTime.UtcNow;

        // Navigation Property
        public ApplicationUser User { get; set; } = null!;
    }
}
