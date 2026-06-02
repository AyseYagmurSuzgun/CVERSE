using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Cverse.Application.DTOs;

namespace Cverse.Application.Interfaces
{
    public interface ICvAnalysisService
    {
        Task<CvAnalysisDto> AnalyzeCvAsync(Guid userId, IFormFile file);
        Task<IEnumerable<CvAnalysisDto>> GetMyAnalysesAsync(Guid userId);
        Task<CvAnalysisDto> GetAnalysisByIdAsync(Guid userId, Guid analysisId);
        Task<bool> DeleteAnalysisAsync(Guid userId, Guid analysisId);
    }
}