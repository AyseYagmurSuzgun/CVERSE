using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace Cverse.Domain.Entities
{
    public class ApplicationUser : IdentityUser<Guid>
    {
        public string AdSoyad { get; set; } = null!;
        public string? ProfilFotografiUrl { get; set; } = null; // Varsayılan olarak null atadık, "string" yazmayacak
        public string? KapakFotografiUrl { get; set; } = null; // EKSİK OLAN KAPAK RESMİ ALANINI BURAYA EKLEDİK
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenBitisTarihi { get; set; }
        public DateTime OlusturmaTarihi { get; set; } = DateTime.UtcNow;
        public DateTime? LastSeen { get; set; }

        // Navigation Properties
        public UserProfile Profile { get; set; } = null!;
        public ICollection<Education> Educations { get; set; } = new List<Education>();
        public ICollection<Skill> Skills { get; set; } = new List<Skill>();
        public ICollection<Certificate> Certificates { get; set; } = new List<Certificate>();
        public ICollection<Experience> Experiences { get; set; } = new List<Experience>();

        public ICollection<Post> Posts { get; set; } = new List<Post>();
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public ICollection<Like> Likes { get; set; } = new List<Like>();
        public ICollection<Repost> Reposts { get; set; } = new List<Repost>();
        public ICollection<CvAnalysis> CvAnalyses { get; set; } = new List<CvAnalysis>();
        public ICollection<JobApplication> JobApplications { get; set; } = new List<JobApplication>();
    }
}