using System;
using System.Collections.Generic;

namespace Cverse.Domain.Entities
{
    public class CvAnalysis
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string OriginalFileName { get; set; } = null!;
        public string UploadedPdfUrl { get; set; } = null!;
        public string ParsedText { get; set; } = null!;
        
        public int AtsScore { get; set; }
        public int ScoreTechnical { get; set; }
        public int ScoreExperience { get; set; }
        public int ScoreFormatting { get; set; }
        public int ScoreImpact { get; set; }
        public string ExperienceLevel { get; set; } = null!;
        
        public List<string> TechnicalSkills { get; set; } = new();
        public List<string> MissingSkills { get; set; } = new();
        public List<string> Strengths { get; set; } = new();
        public List<string> Weaknesses { get; set; } = new();
        public List<string> JobSuggestions { get; set; } = new();
        public List<string> ImprovementSuggestions { get; set; } = new();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ApplicationUser User { get; set; } = null!;
    }
}