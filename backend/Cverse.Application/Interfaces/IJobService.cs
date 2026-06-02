using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Cverse.Application.DTOs;

namespace Cverse.Application.Interfaces
{
    public interface IJobService
    {
        Task<List<JobDto>> GetJobsAsync(Guid userId);
        Task<JobDto?> GetJobByIdAsync(Guid id, Guid userId);
        Task<bool> ApplyToJobAsync(Guid jobId, Guid userId);
        Task<List<JobDto>> GetRecommendedJobsAsync(Guid userId);
        Task<List<JobDto>> SearchJobsAsync(JobSearchRequest request, Guid userId);
        Task<List<JobApplicationDto>> GetAppliedJobsAsync(Guid userId);
        Task<bool> UpdateApplicationStatusAsync(Guid applicationId, string status);
    }
}
