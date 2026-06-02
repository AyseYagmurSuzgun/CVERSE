using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Cverse.Application.DTOs;
using Cverse.Application.Interfaces;
using Cverse.Domain.Entities;
using Cverse.Persistence.Context;

namespace Cverse.Infrastructure.Services
{
    public class JobService : IJobService
    {
        private readonly AppDbContext _context;

        public JobService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<JobDto>> GetJobsAsync(Guid userId)
        {
            var jobs = await _context.Jobs
                .Include(j => j.Applications)
                .OrderByDescending(j => j.CreatedAt)
                .ToListAsync();

            var latestCv = await GetLatestCvAnalysisAsync(userId);
            var appliedJobIds = await GetAppliedJobIdsAsync(userId);

            return jobs.Select(j => MapToDto(j, latestCv, appliedJobIds.Contains(j.Id))).ToList();
        }

        public async Task<JobDto?> GetJobByIdAsync(Guid id, Guid userId)
        {
            var job = await _context.Jobs
                .Include(j => j.Applications)
                .FirstOrDefaultAsync(j => j.Id == id);

            if (job == null) return null;

            var latestCv = await GetLatestCvAnalysisAsync(userId);
            var appliedJobIds = await GetAppliedJobIdsAsync(userId);

            return MapToDto(job, latestCv, appliedJobIds.Contains(job.Id));
        }

        public async Task<bool> ApplyToJobAsync(Guid jobId, Guid userId)
        {
            // Verify job exists
            var jobExists = await _context.Jobs.AnyAsync(j => j.Id == jobId);
            if (!jobExists)
                throw new KeyNotFoundException("İş ilanı bulunamadı.");

            // Check if already applied
            var alreadyApplied = await _context.JobApplications
                .AnyAsync(ja => ja.UserId == userId && ja.JobId == jobId);

            if (alreadyApplied)
                return false; // Prevent duplicates

            // Create new job application
            var application = new JobApplication
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                JobId = jobId,
                AppliedAt = DateTime.UtcNow,
                Status = "Applied"
            };

            _context.JobApplications.Add(application);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<JobDto>> GetRecommendedJobsAsync(Guid userId)
        {
            var latestCv = await GetLatestCvAnalysisAsync(userId);
            var appliedJobIds = await GetAppliedJobIdsAsync(userId);

            var jobs = await _context.Jobs
                .Include(j => j.Applications)
                .ToListAsync();

            // Map all jobs with their match scores
            var mappedJobs = jobs
                .Select(j => MapToDto(j, latestCv, appliedJobIds.Contains(j.Id)))
                .ToList();

            // If there's no CV, match scores are null. We just return jobs ordered by CreatedAt
            if (latestCv == null)
            {
                return mappedJobs.OrderByDescending(j => j.CreatedAt).Take(3).ToList();
            }

            // If there's a CV, return the top 3 best matching jobs (descending by MatchScore)
            return mappedJobs
                .OrderByDescending(j => j.MatchScore ?? 0)
                .ThenByDescending(j => j.CreatedAt)
                .Take(3)
                .ToList();
        }

        public async Task<List<JobDto>> SearchJobsAsync(JobSearchRequest request, Guid userId)
        {
            var query = _context.Jobs
                .Include(j => j.Applications)
                .AsQueryable();

            // 1. Text Search Term (Title, Description, CompanyName, Skills)
            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                var term = request.SearchTerm.ToLower();
                query = query.Where(j => 
                    j.Title.ToLower().Contains(term) ||
                    j.Description.ToLower().Contains(term) ||
                    j.CompanyName.ToLower().Contains(term) ||
                    j.RequiredSkills.Any(s => s.ToLower().Contains(term))
                );
            }

            // 2. Location Filtering
            if (!string.IsNullOrWhiteSpace(request.Location))
            {
                var loc = request.Location.ToLower();
                query = query.Where(j => j.Location.ToLower().Contains(loc));
            }

            // 3. Work Type Filtering
            if (!string.IsNullOrWhiteSpace(request.WorkType))
            {
                var wt = request.WorkType.ToLower();
                query = query.Where(j => j.WorkType.ToLower() == wt);
            }

            // 4. Experience Level Filtering
            if (!string.IsNullOrWhiteSpace(request.ExperienceLevel))
            {
                var el = request.ExperienceLevel.ToLower();
                query = query.Where(j => j.ExperienceLevel.ToLower() == el);
            }

            var jobs = await query.OrderByDescending(j => j.CreatedAt).ToListAsync();
            var latestCv = await GetLatestCvAnalysisAsync(userId);
            var appliedJobIds = await GetAppliedJobIdsAsync(userId);

            return jobs.Select(j => MapToDto(j, latestCv, appliedJobIds.Contains(j.Id))).ToList();
        }

        public async Task<List<JobApplicationDto>> GetAppliedJobsAsync(Guid userId)
        {
            var applications = await _context.JobApplications
                .Include(ja => ja.Job)
                .ThenInclude(j => j.Applications)
                .Where(ja => ja.UserId == userId)
                .OrderByDescending(ja => ja.AppliedAt)
                .ToListAsync();

            var latestCv = await GetLatestCvAnalysisAsync(userId);

            return applications.Select(ja =>
            {
                var jobDto = MapToDto(ja.Job, latestCv, true);
                return new JobApplicationDto
                {
                    Id = ja.Id,
                    JobId = ja.JobId,
                    JobTitle = ja.Job.Title,
                    CompanyName = ja.Job.CompanyName,
                    CompanyLogoUrl = ja.Job.CompanyLogoUrl,
                    Location = ja.Job.Location,
                    WorkType = ja.Job.WorkType,
                    ExperienceLevel = ja.Job.ExperienceLevel,
                    AppliedAt = ja.AppliedAt,
                    Status = ja.Status,
                    MatchScore = jobDto.MatchScore
                };
            }).ToList();
        }

        public async Task<bool> UpdateApplicationStatusAsync(Guid applicationId, string status)
        {
            var app = await _context.JobApplications.FirstOrDefaultAsync(ja => ja.Id == applicationId);
            if (app == null) return false;

            app.Status = status;
            await _context.SaveChangesAsync();
            return true;
        }

        #region Helper Methods

        private async Task<CvAnalysis?> GetLatestCvAnalysisAsync(Guid userId)
        {
            return await _context.CvAnalyses
                .Where(c => c.UserId == userId)
                .OrderByDescending(c => c.CreatedAt)
                .FirstOrDefaultAsync();
        }

        private async Task<HashSet<Guid>> GetAppliedJobIdsAsync(Guid userId)
        {
            var ids = await _context.JobApplications
                .Where(ja => ja.UserId == userId)
                .Select(ja => ja.JobId)
                .ToListAsync();

            return new HashSet<Guid>(ids);
        }

        private JobDto MapToDto(Job job, CvAnalysis? latestCv, bool hasApplied)
        {
            var dto = new JobDto
            {
                Id = job.Id,
                Title = job.Title,
                Description = job.Description,
                CompanyName = job.CompanyName,
                CompanyLogoUrl = job.CompanyLogoUrl,
                Location = job.Location,
                WorkType = job.WorkType,
                ExperienceLevel = job.ExperienceLevel,
                SalaryRange = job.SalaryRange,
                RequiredSkills = job.RequiredSkills,
                CreatedAt = job.CreatedAt,
                HasApplied = hasApplied
            };

            if (latestCv == null)
            {
                dto.MatchScore = null;
                dto.MatchDetails = null;
                return dto;
            }

            // Calculate deterministic AI matching score
            // 1. Required Skills Match (50% weight)
            double skillPoints = 0;
            var matchedSkills = new List<string>();
            var missingSkills = new List<string>();

            if (job.RequiredSkills != null && job.RequiredSkills.Any())
            {
                var userSkills = new HashSet<string>(
                    (latestCv.TechnicalSkills ?? new List<string>())
                    .Select(s => s.Trim().ToLower()), 
                    StringComparer.OrdinalIgnoreCase
                );

                foreach (var skill in job.RequiredSkills)
                {
                    if (userSkills.Contains(skill.Trim().ToLower()))
                    {
                        matchedSkills.Add(skill);
                    }
                    else
                    {
                        missingSkills.Add(skill);
                    }
                }

                double skillRatio = (double)matchedSkills.Count / job.RequiredSkills.Count;
                skillPoints = 50.0 * skillRatio;
            }
            else
            {
                skillPoints = 50.0; // Job has no skill requirements, free points
            }

            // 2. Experience Level Match (30% weight)
            double expPoints = 0;
            int jobLevel = GetExperienceLevelRank(job.ExperienceLevel);
            int userLevel = GetExperienceLevelRank(latestCv.ExperienceLevel);

            if (userLevel >= jobLevel)
            {
                expPoints = 30.0; // Fully matches or exceeds
            }
            else if (jobLevel - userLevel == 1)
            {
                expPoints = 20.0; // 1 level below
            }
            else if (jobLevel - userLevel == 2)
            {
                expPoints = 10.0; // 2 levels below
            }
            else
            {
                expPoints = 0.0;
            }

            // 3. General ATS Score contribution (20% weight)
            double atsPoints = 0.20 * latestCv.AtsScore;

            // Compile final score (rounded)
            dto.MatchScore = (int)Math.Round(skillPoints + expPoints + atsPoints);

            // Construct Match Details message
            if (matchedSkills.Any() || missingSkills.Any())
            {
                var detailsParts = new List<string>();
                if (matchedSkills.Any())
                {
                    detailsParts.Add($"Eşleşen Yetenekler: {string.Join(", ", matchedSkills)}");
                }
                if (missingSkills.Any())
                {
                    detailsParts.Add($"Eksik Yetenekler: {string.Join(", ", missingSkills)}");
                }
                dto.MatchDetails = string.Join(" | ", detailsParts);
            }
            else
            {
                dto.MatchDetails = "Eşleşen yetenek bilgisi bulunmuyor.";
            }

            return dto;
        }

        private int GetExperienceLevelRank(string? level)
        {
            if (string.IsNullOrWhiteSpace(level)) return 1;

            return level.Trim().ToLower() switch
            {
                "junior" => 1,
                "mid" => 2,
                "senior" => 3,
                "lead" => 4,
                _ => 1 // Default to Junior rank
            };
        }

        #endregion
    }
}
