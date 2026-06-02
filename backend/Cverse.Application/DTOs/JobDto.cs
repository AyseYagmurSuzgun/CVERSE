using System;
using System.Collections.Generic;

namespace Cverse.Application.DTOs
{
    public class JobDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string? CompanyLogoUrl { get; set; }
        public string Location { get; set; } = string.Empty;
        public string WorkType { get; set; } = string.Empty;
        public string ExperienceLevel { get; set; } = string.Empty;
        public string? SalaryRange { get; set; }
        public List<string> RequiredSkills { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public bool HasApplied { get; set; }
        public int? MatchScore { get; set; }
        public string? MatchDetails { get; set; }
    }

    public class JobSearchRequest
    {
        public string? SearchTerm { get; set; }
        public string? Location { get; set; }
        public string? WorkType { get; set; }
        public string? ExperienceLevel { get; set; }
    }

    public class JobApplicationDto
    {
        public Guid Id { get; set; }
        public Guid JobId { get; set; }
        public string JobTitle { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string? CompanyLogoUrl { get; set; }
        public string Location { get; set; } = string.Empty;
        public string WorkType { get; set; } = string.Empty;
        public string ExperienceLevel { get; set; } = string.Empty;
        public DateTime AppliedAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public int? MatchScore { get; set; }
    }
}

