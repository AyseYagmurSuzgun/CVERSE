using System;
using System.Collections.Generic;

namespace Cverse.Domain.Entities
{
    public class Job
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string CompanyName { get; set; } = null!;
        public string? CompanyLogoUrl { get; set; }
        public string Location { get; set; } = null!;
        public string WorkType { get; set; } = null!;
        public string ExperienceLevel { get; set; } = null!;
        public string? SalaryRange { get; set; }
        public List<string> RequiredSkills { get; set; } = new();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<JobApplication> Applications { get; set; } = new List<JobApplication>();
    }
}
