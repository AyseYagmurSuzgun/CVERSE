using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Cverse.Application.DTOs;
using Cverse.Application.Interfaces;
using Cverse.Domain.Entities;
using Cverse.Persistence.Context;

namespace Cverse.Infrastructure.Services
{
    public class ProfileService : IProfileService
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IMapper _mapper;
        private readonly IFileService _fileService;

        public ProfileService(
            AppDbContext context,
            UserManager<ApplicationUser> userManager,
            IMapper mapper,
            IFileService fileService)
        {
            _context = context;
            _userManager = userManager;
            _mapper = mapper;
            _fileService = fileService;
        }

        public async Task<UserProfileDto> GetProfileAsync(Guid userId)
        {
            var user = await _userManager.Users
                .Include(x => x.Profile)
                .Include(x => x.Educations)
                .Include(x => x.Experiences)
                .Include(x => x.Skills)
                .Include(x => x.Certificates)
                .FirstOrDefaultAsync(x => x.Id == userId);

            if (user == null)
                throw new KeyNotFoundException("Kullanıcı bulunamadı.");

            if (user.Profile == null)
            {
                var newProfile = new UserProfile
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    OlusturmaTarihi = DateTime.UtcNow,
                    GuncellemeTarihi = DateTime.UtcNow
                };

                _context.UserProfiles.Add(newProfile);
                await _context.SaveChangesAsync();

                user.Profile = newProfile;
            }

            user.Profile.User = user;

            return _mapper.Map<UserProfileDto>(user.Profile);
        }

        public async Task<UserProfileDto> UpdateProfileAsync(Guid userId, UpdateUserProfileDto dto)
        {
            var user = await _userManager.Users
                .Include(x => x.Profile)
                .Include(x => x.Educations)
                .Include(x => x.Experiences)
                .Include(x => x.Skills)
                .Include(x => x.Certificates)
                .FirstOrDefaultAsync(x => x.Id == userId);

            if (user == null)
                throw new KeyNotFoundException("Kullanıcı bulunamadı.");

            if (user.AdSoyad != dto.AdSoyad || user.KapakFotografiUrl != dto.KapakFotografiUrl)
            {
                user.AdSoyad = dto.AdSoyad;
                user.KapakFotografiUrl = dto.KapakFotografiUrl;
                await _userManager.UpdateAsync(user);
            }

            if (user.Profile == null)
            {
                user.Profile = new UserProfile
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    OlusturmaTarihi = DateTime.UtcNow
                };
                _context.UserProfiles.Add(user.Profile);
            }

            user.Profile.Bio = dto.Bio;
            user.Profile.Unvan = dto.Unvan;
            user.Profile.Konum = dto.Konum;
            user.Profile.LinkedInUrl = dto.LinkedInUrl;
            user.Profile.GitHubUrl = dto.GitHubUrl;
            user.Profile.TwitterUrl = dto.TwitterUrl;
            user.Profile.WebsiteUrl = dto.WebsiteUrl;
            user.Profile.GuncellemeTarihi = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            user.Profile.User = user;

            return _mapper.Map<UserProfileDto>(user.Profile);
        }

        public async Task<string> UploadProfilePhotoAsync(Guid userId, IFormFile file)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
                throw new KeyNotFoundException("Kullanıcı bulunamadı.");

            if (!string.IsNullOrEmpty(user.ProfilFotografiUrl))
            {
                await _fileService.DeleteImageAsync(user.ProfilFotografiUrl);
            }

            var imageUrl = await _fileService.UploadImageAsync(file, "profile-photos");

            user.ProfilFotografiUrl = imageUrl;
            await _userManager.UpdateAsync(user);

            return imageUrl;
        }

        public async Task<string> UploadCoverPhotoAsync(Guid userId, IFormFile file)
        {
            var user = await _userManager.Users
                .Include(x => x.Profile)
                .FirstOrDefaultAsync(x => x.Id == userId);

            if (user == null)
                throw new KeyNotFoundException("Kullanıcı bulunamadı.");

            if (user.Profile == null)
            {
                user.Profile = new UserProfile
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    OlusturmaTarihi = DateTime.UtcNow
                };
                _context.UserProfiles.Add(user.Profile);
            }

            if (!string.IsNullOrEmpty(user.KapakFotografiUrl))
            {
                await _fileService.DeleteImageAsync(user.KapakFotografiUrl);
            }

            var imageUrl = await _fileService.UploadImageAsync(file, "cover-photos");

            user.KapakFotografiUrl = imageUrl;
            user.Profile.GuncellemeTarihi = DateTime.UtcNow;
            
            await _userManager.UpdateAsync(user);
            await _context.SaveChangesAsync();

            return imageUrl;
        }

        public async Task<EducationDto> AddEducationAsync(Guid userId, CreateEducationDto dto)
        {
            var userExists = await _userManager.Users.AnyAsync(x => x.Id == userId);
            if (!userExists)
                throw new KeyNotFoundException("Kullanıcı bulunamadı.");

            var education = _mapper.Map<Education>(dto);
            education.Id = Guid.NewGuid();
            education.UserId = userId;
            education.OlusturmaTarihi = DateTime.UtcNow;

            _context.Educations.Add(education);
            await _context.SaveChangesAsync();

            return _mapper.Map<EducationDto>(education);
        }

        public async Task<EducationDto> UpdateEducationAsync(Guid userId, Guid educationId, CreateEducationDto dto)
        {
            var education = await _context.Educations
                .FirstOrDefaultAsync(x => x.Id == educationId && x.UserId == userId);

            if (education == null)
                throw new KeyNotFoundException("Eğitim kaydı bulunamadı.");

            _mapper.Map(dto, education);
            await _context.SaveChangesAsync();

            return _mapper.Map<EducationDto>(education);
        }

        public async Task<bool> DeleteEducationAsync(Guid userId, Guid educationId)
        {
            var education = await _context.Educations
                .FirstOrDefaultAsync(x => x.Id == educationId && x.UserId == userId);

            if (education == null) return false;

            _context.Educations.Remove(education);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<ExperienceDto> AddExperienceAsync(Guid userId, CreateExperienceDto dto)
        {
            var userExists = await _userManager.Users.AnyAsync(x => x.Id == userId);
            if (!userExists)
                throw new KeyNotFoundException("Kullanıcı bulunamadı.");

            var experience = _mapper.Map<Experience>(dto);
            experience.Id = Guid.NewGuid();
            experience.UserId = userId;
            experience.OlusturmaTarihi = DateTime.UtcNow;

            _context.Experiences.Add(experience);
            await _context.SaveChangesAsync();

            return _mapper.Map<ExperienceDto>(experience);
        }

        public async Task<ExperienceDto> UpdateExperienceAsync(Guid userId, Guid experienceId, CreateExperienceDto dto)
        {
            var experience = await _context.Experiences
                .FirstOrDefaultAsync(x => x.Id == experienceId && x.UserId == userId);

            if (experience == null)
                throw new KeyNotFoundException("Deneyim kaydı bulunamadı.");

            _mapper.Map(dto, experience);
            await _context.SaveChangesAsync();

            return _mapper.Map<ExperienceDto>(experience);
        }

        public async Task<bool> DeleteExperienceAsync(Guid userId, Guid experienceId)
        {
            var experience = await _context.Experiences
                .FirstOrDefaultAsync(x => x.Id == experienceId && x.UserId == userId);

            if (experience == null) return false;

            _context.Experiences.Remove(experience);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<SkillDto> AddSkillAsync(Guid userId, CreateSkillDto dto)
        {
            var userExists = await _userManager.Users.AnyAsync(x => x.Id == userId);
            if (!userExists)
                throw new KeyNotFoundException("Kullanıcı bulunamadı.");

            var existingSkill = await _context.Skills
                .FirstOrDefaultAsync(x => x.UserId == userId && x.YetenekAdi.ToLower() == dto.YetenekAdi.ToLower());

            if (existingSkill != null)
                return _mapper.Map<SkillDto>(existingSkill);

            var skill = _mapper.Map<Skill>(dto);
            skill.Id = Guid.NewGuid();
            skill.UserId = userId;
            skill.OlusturmaTarihi = DateTime.UtcNow;

            _context.Skills.Add(skill);
            await _context.SaveChangesAsync();

            return _mapper.Map<SkillDto>(skill);
        }

        public async Task<bool> DeleteSkillAsync(Guid userId, Guid skillId)
        {
            var skill = await _context.Skills
                .FirstOrDefaultAsync(x => x.Id == skillId && x.UserId == userId);

            if (skill == null) return false;

            _context.Skills.Remove(skill);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<CertificateDto> AddCertificateAsync(Guid userId, CreateCertificateDto dto)
        {
            var userExists = await _userManager.Users.AnyAsync(x => x.Id == userId);
            if (!userExists)
                throw new KeyNotFoundException("Kullanıcı bulunamadı.");

            var certificate = _mapper.Map<Certificate>(dto);
            certificate.Id = Guid.NewGuid();
            certificate.UserId = userId;
            certificate.OlusturmaTarihi = DateTime.UtcNow;

            _context.Certificates.Add(certificate);
            await _context.SaveChangesAsync();

            return _mapper.Map<CertificateDto>(certificate);
        }

        public async Task<CertificateDto> UpdateCertificateAsync(Guid userId, Guid certificateId, CreateCertificateDto dto)
        {
            var certificate = await _context.Certificates
                .FirstOrDefaultAsync(x => x.Id == certificateId && x.UserId == userId);

            if (certificate == null)
                throw new KeyNotFoundException("Sertifika kaydı bulunamadı.");

            _mapper.Map(dto, certificate);
            await _context.SaveChangesAsync();

            return _mapper.Map<CertificateDto>(certificate);
        }

        public async Task<bool> DeleteCertificateAsync(Guid userId, Guid certificateId)
        {
            var certificate = await _context.Certificates
                .FirstOrDefaultAsync(x => x.Id == certificateId && x.UserId == userId);

            if (certificate == null) return false;

            _context.Certificates.Remove(certificate);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
