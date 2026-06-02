using System;

namespace Cverse.Domain.Entities
{
    public class UserProfile
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string? Bio { get; set; }
        public string? Unvan { get; set; }
        public string? Konum { get; set; }
        //public string? KapakFotografiUrl { get; set; }
        public string? LinkedInUrl { get; set; }
        public string? GitHubUrl { get; set; }
        public string? TwitterUrl { get; set; }
        public string? WebsiteUrl { get; set; }
        public DateTime OlusturmaTarihi { get; set; } = DateTime.UtcNow;
        public DateTime GuncellemeTarihi { get; set; } = DateTime.UtcNow;

        // Navigation Property
        public ApplicationUser User { get; set; } = null!;
    }
}
