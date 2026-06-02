using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Cverse.Domain.Entities;
using System.Reflection;

namespace Cverse.Persistence.Context
{
    public class AppDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<UserProfile> UserProfiles { get; set; }
        public DbSet<Education> Educations { get; set; }
        public DbSet<Skill> Skills { get; set; }
        public DbSet<Certificate> Certificates { get; set; }
        public DbSet<Experience> Experiences { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<PostImage> PostImages { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Like> Likes { get; set; }
        public DbSet<Repost> Reposts { get; set; }
        public DbSet<Follow> Follows { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Conversation> Conversations { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<CommentLike> CommentLikes { get; set; }
        public DbSet<CvAnalysis> CvAnalyses { get; set; }
        public DbSet<Job> Jobs { get; set; }
        public DbSet<JobApplication> JobApplications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

            // Configure CvAnalysis mapping
            modelBuilder.Entity<CvAnalysis>().ToTable("CvAnalysis");
            modelBuilder.Entity<CvAnalysis>()
                .HasOne(c => c.User)
                .WithMany(u => u.CvAnalyses)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Map to singular table names matching the migration 'AddFeedSystem'
            modelBuilder.Entity<Post>().ToTable("Post");
            modelBuilder.Entity<Comment>().ToTable("Comment");
            modelBuilder.Entity<Like>().ToTable("Like");
            modelBuilder.Entity<PostImage>().ToTable("PostImage");
            modelBuilder.Entity<Repost>().ToTable("Repost");

            // Configure CommentLike mapping
            modelBuilder.Entity<CommentLike>().ToTable("CommentLike");
            modelBuilder.Entity<CommentLike>()
                .HasOne(cl => cl.Comment)
                .WithMany(c => c.Likes)
                .HasForeignKey(cl => cl.CommentId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<CommentLike>()
                .HasOne(cl => cl.User)
                .WithMany()
                .HasForeignKey(cl => cl.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Follow relationships
            modelBuilder.Entity<Follow>().ToTable("Follow");

            modelBuilder.Entity<Follow>()
                .HasOne(f => f.Follower)
                .WithMany()
                .HasForeignKey(f => f.FollowerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Follow>()
                .HasOne(f => f.Followed)
                .WithMany()
                .HasForeignKey(f => f.FollowedId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Notification mapping
            modelBuilder.Entity<Notification>().ToTable("Notification");
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany()
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.TriggeredBy)
                .WithMany()
                .HasForeignKey(n => n.TriggeredById)
                .OnDelete(DeleteBehavior.SetNull);

            // Configure Conversation mapping
            modelBuilder.Entity<Conversation>().ToTable("Conversation");
            modelBuilder.Entity<Conversation>()
                .HasOne(c => c.User1)
                .WithMany()
                .HasForeignKey(c => c.User1Id)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Conversation>()
                .HasOne(c => c.User2)
                .WithMany()
                .HasForeignKey(c => c.User2Id)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Message mapping
            modelBuilder.Entity<Message>().ToTable("Message");
            modelBuilder.Entity<Message>()
                .HasOne(m => m.Conversation)
                .WithMany(c => c.Messages)
                .HasForeignKey(m => m.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Message>()
                .HasOne(m => m.Sender)
                .WithMany()
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Message>()
                .HasOne(m => m.Receiver)
                .WithMany()
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Job mapping
            modelBuilder.Entity<Job>().ToTable("Job");

            // Configure JobApplication mapping
            modelBuilder.Entity<JobApplication>().ToTable("JobApplication");
            modelBuilder.Entity<JobApplication>()
                .HasKey(ja => ja.Id);
            modelBuilder.Entity<JobApplication>()
                .HasIndex(ja => new { ja.UserId, ja.JobId })
                .IsUnique();
            modelBuilder.Entity<JobApplication>()
                .HasOne(ja => ja.User)
                .WithMany(u => u.JobApplications)
                .HasForeignKey(ja => ja.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<JobApplication>()
                .HasOne(ja => ja.Job)
                .WithMany(j => j.Applications)
                .HasForeignKey(ja => ja.JobId)
                .OnDelete(DeleteBehavior.Cascade);

            // Seed premium jobs
            var baseDate = new DateTime(2026, 5, 22, 12, 0, 0, DateTimeKind.Utc);
            modelBuilder.Entity<Job>().HasData(
                new Job
                {
                    Id = Guid.Parse("1a580a15-090c-43f3-9d0d-9b5d4f3b7b2a"),
                    Title = "Senior React Developer",
                    Description = "Looking for a seasoned React Developer to build premium, high-performance, glassmorphic Web UIs. You will be responsible for creating fluid user experiences, styling with high-performance CSS/Tailwind, and integrating with RESTful and WebSockets APIs.",
                    CompanyName = "Vespera Tech",
                    CompanyLogoUrl = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop",
                    Location = "İstanbul, TR (Hybrid)",
                    WorkType = "Hybrid",
                    ExperienceLevel = "Senior",
                    SalaryRange = "80,000 - 110,000 TRY",
                    RequiredSkills = new List<string> { "React", "JavaScript", "TypeScript", "CSS", "Tailwind CSS", "Redux" },
                    CreatedAt = baseDate
                },
                new Job
                {
                    Id = Guid.Parse("2b691b26-1a1d-44e4-ae1e-ac6e5e4c8c3b"),
                    Title = "Lead .NET Core Architect",
                    Description = "We are seeking a Lead Backend Architect with deep knowledge in ASP.NET Core, EF Core, and PostgreSQL. You will design additive, scalable, microservice-ready backend APIs, configure PostgreSQL constraints, implement Real-time SignalR notifications, and secure authentication flows.",
                    CompanyName = "Cverse Solutions",
                    CompanyLogoUrl = "https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&h=100&fit=crop",
                    Location = "Ankara, TR (On-Site)",
                    WorkType = "On-Site",
                    ExperienceLevel = "Lead",
                    SalaryRange = "95,000 - 130,000 TRY",
                    RequiredSkills = new List<string> { ".NET Core", "ASP.NET Core", "C#", "Entity Framework Core", "PostgreSQL", "SignalR", "RESTful API" },
                    CreatedAt = baseDate.AddDays(-1)
                },
                new Job
                {
                    Id = Guid.Parse("3c702c37-2b2e-45f5-bf2f-bd7f6f5d9d4c"),
                    Title = "Senior DevOps & Cloud Engineer",
                    Description = "Join us to manage our automated CI/CD pipelines, Dockerized deployments, and cloud infrastructure. You will work extensively with Docker, Kubernetes, GitHub Actions, AWS, and Linux environments to guarantee zero-downtime deployments.",
                    CompanyName = "Nebula Cloud Solutions",
                    CompanyLogoUrl = "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=100&h=100&fit=crop",
                    Location = "Remote, TR",
                    WorkType = "Remote",
                    ExperienceLevel = "Senior",
                    SalaryRange = "90,000 - 120,000 TRY",
                    RequiredSkills = new List<string> { "Docker", "Kubernetes", "AWS", "CI/CD", "GitHub Actions", "Linux", "Terraform" },
                    CreatedAt = baseDate.AddDays(-2)
                },
                new Job
                {
                    Id = Guid.Parse("4d813d48-3c3f-46f6-c03f-ce8f7f6e0e5d"),
                    Title = "Junior Backend Developer (C#)",
                    Description = "Excellent opportunity for an aspiring C# developer to grow under senior mentorship. You will help build and maintain backend REST APIs using C# and ASP.NET Core, write database queries with EF Core, and implement modular features using additive architecture.",
                    CompanyName = "Innovate Labs",
                    CompanyLogoUrl = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop",
                    Location = "İzmir, TR (Hybrid)",
                    WorkType = "Hybrid",
                    ExperienceLevel = "Junior",
                    SalaryRange = "40,000 - 55,000 TRY",
                    RequiredSkills = new List<string> { "C#", ".NET Core", "ASP.NET Core", "Entity Framework Core", "PostgreSQL", "Git" },
                    CreatedAt = baseDate.AddDays(-3)
                },
                new Job
                {
                    Id = Guid.Parse("5e924e59-4d4f-47f7-d14f-df9f8f7f1f6e"),
                    Title = "Data & Python Systems Analyst",
                    Description = "Seeking a Data Analyst to develop AI matching algorithms, analyze CV text extraction outputs, and build Python scripts for statistical modeling. You will work with pandas, NumPy, scikit-learn, and REST integrations with .NET Core services.",
                    CompanyName = "Apex Intelligence",
                    CompanyLogoUrl = "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=100&h=100&fit=crop",
                    Location = "Remote, Global",
                    WorkType = "Remote",
                    ExperienceLevel = "Mid",
                    SalaryRange = "70,000 - 90,000 TRY",
                    RequiredSkills = new List<string> { "Python", "pandas", "NumPy", "scikit-learn", "SQL", "Machine Learning", "Data Analysis" },
                    CreatedAt = baseDate.AddDays(-4)
                }
            );
        }

        // PostgreSQL 'timestamp with time zone' tipi yalnızca UTC kabul eder.
        // Frontend'den gelen DateTime değerleri Kind=Unspecified olabiliyor.
        // Bu override tüm DateTime'ları otomatik UTC'ye dönüştürür.
        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            ConvertDateTimesToUtc();
            return await base.SaveChangesAsync(cancellationToken);
        }

        public override int SaveChanges()
        {
            ConvertDateTimesToUtc();
            return base.SaveChanges();
        }

        private void ConvertDateTimesToUtc()
        {
            foreach (var entry in ChangeTracker.Entries())
            {
                if (entry.State == EntityState.Added || entry.State == EntityState.Modified)
                {
                    foreach (var property in entry.Properties)
                    {
                        if (property.CurrentValue is DateTime dt && dt.Kind != DateTimeKind.Utc)
                        {
                            property.CurrentValue = DateTime.SpecifyKind(dt, DateTimeKind.Utc);
                        }
                    }
                }
            }
        }
    }
}

