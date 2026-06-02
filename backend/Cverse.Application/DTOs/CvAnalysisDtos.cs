using System;
using System.Collections.Generic;

namespace Cverse.Application.DTOs
{
    public class CvAnalysisDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string OriginalFileName { get; set; } = string.Empty;
        public string UploadedPdfUrl { get; set; } = string.Empty;
        public int AtsScore { get; set; }
        public int ScoreTechnical { get; set; }
        public int ScoreExperience { get; set; }
        public int ScoreFormatting { get; set; }
        public int ScoreImpact { get; set; }
        public string ExperienceLevel { get; set; } = string.Empty;
        public List<string> TechnicalSkills { get; set; } = new();
        public List<string> MissingSkills { get; set; } = new();
        public List<string> Strengths { get; set; } = new();
        public List<string> Weaknesses { get; set; } = new();
        public List<string> JobSuggestions { get; set; } = new();
        public List<string> ImprovementSuggestions { get; set; } = new();
        public DateTime CreatedAt { get; set; }
    }

    public class AiCvResponse
    {
        public bool IsCv { get; set; }
        public int AtsScore { get; set; }
        public int ScoreTechnical { get; set; }
        public int ScoreExperience { get; set; }
        public int ScoreFormatting { get; set; }
        public int ScoreImpact { get; set; }
        public string ExperienceLevel { get; set; } = string.Empty;
        public List<string> TechnicalSkills { get; set; } = new();
        public List<string> MissingSkills { get; set; } = new();
        public List<string> Strengths { get; set; } = new();
        public List<string> Weaknesses { get; set; } = new();
        public List<string> JobSuggestions { get; set; } = new();
        public List<string> ImprovementSuggestions { get; set; } = new();
    }
}