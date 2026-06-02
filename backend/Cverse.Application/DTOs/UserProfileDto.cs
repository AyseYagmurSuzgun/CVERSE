using System;
using System.Collections.Generic;

namespace Cverse.Application.DTOs
{
    public class UserProfileDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string AdSoyad { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string KullaniciAdi { get; set; } = null!;
        public string? ProfilFotografiUrl { get; set; }
        public string? KapakFotografiUrl { get; set; }
        public string? Bio { get; set; }
        public string? Unvan { get; set; }
        public string? Konum { get; set; }
        public string? LinkedInUrl { get; set; }
        public string? GitHubUrl { get; set; }
        public string? TwitterUrl { get; set; }
        public string? WebsiteUrl { get; set; }

        public ICollection<EducationDto> Educations { get; set; } = new List<EducationDto>();
        public ICollection<ExperienceDto> Experiences { get; set; } = new List<ExperienceDto>();
        public ICollection<SkillDto> Skills { get; set; } = new List<SkillDto>();
        public ICollection<CertificateDto> Certificates { get; set; } = new List<CertificateDto>();
    }

    public class UpdateUserProfileDto
    {
        public string AdSoyad { get; set; } = null!;
        public string? Bio { get; set; }
        public string? Unvan { get; set; }
        public string? Konum { get; set; }
        public string? LinkedInUrl { get; set; }
        public string? GitHubUrl { get; set; }
        public string? TwitterUrl { get; set; }
        public string? WebsiteUrl { get; set; }
        public string? KapakFotografiUrl { get; set; }
    }
}
