using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Cverse.Application.DTOs;

namespace Cverse.Application.Interfaces
{
    public interface IProfileService
    {
        Task<UserProfileDto> GetProfileAsync(Guid userId);
        Task<UserProfileDto> UpdateProfileAsync(Guid userId, UpdateUserProfileDto dto);
        Task<string> UploadProfilePhotoAsync(Guid userId, IFormFile file);
        Task<string> UploadCoverPhotoAsync(Guid userId, IFormFile file);

        // Education
        Task<EducationDto> AddEducationAsync(Guid userId, CreateEducationDto dto);
        Task<EducationDto> UpdateEducationAsync(Guid userId, Guid educationId, CreateEducationDto dto);
        Task<bool> DeleteEducationAsync(Guid userId, Guid educationId);

        // Experience
        Task<ExperienceDto> AddExperienceAsync(Guid userId, CreateExperienceDto dto);
        Task<ExperienceDto> UpdateExperienceAsync(Guid userId, Guid experienceId, CreateExperienceDto dto);
        Task<bool> DeleteExperienceAsync(Guid userId, Guid experienceId);

        // Skill
        Task<SkillDto> AddSkillAsync(Guid userId, CreateSkillDto dto);
        Task<bool> DeleteSkillAsync(Guid userId, Guid skillId);

        // Certificate
        Task<CertificateDto> AddCertificateAsync(Guid userId, CreateCertificateDto dto);
        Task<CertificateDto> UpdateCertificateAsync(Guid userId, Guid certificateId, CreateCertificateDto dto);
        Task<bool> DeleteCertificateAsync(Guid userId, Guid certificateId);
    }
}
