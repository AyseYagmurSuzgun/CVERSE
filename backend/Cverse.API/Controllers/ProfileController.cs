using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FluentValidation;
using Cverse.Application.DTOs;
using Cverse.Application.Interfaces;
using Microsoft.AspNetCore.Identity;
using Cverse.Domain.Entities;
using Cverse.Persistence.Context;

namespace Cverse.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController : BaseApiController
    {
        private readonly IProfileService _profileService;
        private readonly IValidator<UpdateUserProfileDto> _updateProfileValidator;
        private readonly IValidator<CreateEducationDto> _educationValidator;
        private readonly IValidator<CreateExperienceDto> _experienceValidator;
        private readonly IValidator<CreateSkillDto> _skillValidator;
        private readonly IValidator<CreateCertificateDto> _certificateValidator;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly AppDbContext _dbContext;

        public ProfileController(
            IProfileService profileService,
            IValidator<UpdateUserProfileDto> updateProfileValidator,
            IValidator<CreateEducationDto> educationValidator,
            IValidator<CreateExperienceDto> experienceValidator,
            IValidator<CreateSkillDto> skillValidator,
            IValidator<CreateCertificateDto> certificateValidator,
            UserManager<ApplicationUser> userManager,
            AppDbContext dbContext)
        {
            _profileService = profileService;
            _updateProfileValidator = updateProfileValidator;
            _educationValidator = educationValidator;
            _experienceValidator = experienceValidator;
            _skillValidator = skillValidator;
            _certificateValidator = certificateValidator;
            _userManager = userManager;
            _dbContext = dbContext;
        }

        private Guid GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                throw new UnauthorizedAccessException("Oturum açmış kullanıcı bulunamadı.");
            }
            return Guid.Parse(userIdClaim.Value);
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var userId = GetUserId();
                var profile = await _profileService.GetProfileAsync(userId);
                return Ok(new { Basarili = true, Mesaj = "Profil başarıyla getirildi.", Data = profile });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Basarili = false, Mesaj = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Basarili = false, Mesaj = "Profil getirilirken bir hata oluştu.", Hata = ex.Message });
            }
        }

        [HttpGet("{userId:guid}")]
        public async Task<IActionResult> GetProfileById(Guid userId)
        {
            try
            {
                var profile = await _profileService.GetProfileAsync(userId);
                return Ok(new { Basarili = true, Mesaj = "Profil başarıyla getirildi.", Data = profile });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Basarili = false, Mesaj = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Basarili = false, Mesaj = "Profil getirilirken bir hata oluştu.", Hata = ex.Message });
            }
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileDto dto)
        {
            var validationResult = await _updateProfileValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { Basarili = false, Mesaj = "Girdiğiniz bilgileri kontrol ediniz.", Hatalar = validationResult.Errors.Select(x => x.ErrorMessage) });
            }

            try
            {
                var userId = GetUserId();
                var updatedProfile = await _profileService.UpdateProfileAsync(userId, dto);
                return Ok(new { Basarili = true, Mesaj = "Profil başarıyla güncellendi.", Data = updatedProfile });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Basarili = false, Mesaj = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Basarili = false, Mesaj = "Profil güncellenirken bir hata oluştu.", Hata = ex.Message });
            }
        }

        [HttpPost("upload-photo")]
        public async Task<IActionResult> UploadPhoto([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { Basarili = false, Mesaj = "Lütfen geçerli bir dosya seçin." });
            }

            if (file.Length > 5 * 1024 * 1024)
            {
                return BadRequest(new { Basarili = false, Mesaj = "Dosya boyutu 5 MB'dan büyük olamaz." });
            }

            if (!file.ContentType.StartsWith("image/"))
            {
                return BadRequest(new { Basarili = false, Mesaj = "Yalnızca resim dosyaları yüklenebilir." });
            }

            try
            {
                var userId = GetUserId();
                var imageUrl = await _profileService.UploadProfilePhotoAsync(userId, file);
                return Ok(new { Basarili = true, Mesaj = "Profil fotoğrafı başarıyla yüklendi.", Data = new { Url = imageUrl } });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Basarili = false, Mesaj = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Basarili = false, Mesaj = "Profil fotoğrafı yüklenirken bir hata oluştu.", Hata = ex.Message });
            }
        }

        [HttpPost("upload-cover")]
        public async Task<IActionResult> UploadCover([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { Basarili = false, Mesaj = "Lütfen geçerli bir dosya seçin." });
            }

            if (file.Length > 5 * 1024 * 1024)
            {
                return BadRequest(new { Basarili = false, Mesaj = "Dosya boyutu 5 MB'dan büyük olamaz." });
            }

            if (!file.ContentType.StartsWith("image/"))
            {
                return BadRequest(new { Basarili = false, Mesaj = "Yalnızca resim dosyaları yüklenebilir." });
            }

            try
            {
                var userId = GetUserId();
                var imageUrl = await _profileService.UploadCoverPhotoAsync(userId, file);
                return Ok(new { Basarili = true, Mesaj = "Kapak fotoğrafı başarıyla yüklendi.", Data = new { Url = imageUrl } });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Basarili = false, Mesaj = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Basarili = false, Mesaj = "Kapak fotoğrafı yüklenirken bir hata oluştu.", Hata = ex.Message });
            }
        }

        // --- EDUCATION ---
        [HttpPost("education")]
        public async Task<IActionResult> AddEducation([FromBody] CreateEducationDto dto)
        {
            dto.BaslangicTarihi = DateTime.SpecifyKind(dto.BaslangicTarihi, DateTimeKind.Utc);
            dto.BitisTarihi = dto.BitisTarihi.HasValue ? DateTime.SpecifyKind(dto.BitisTarihi.Value, DateTimeKind.Utc) : null;

            var validationResult = await _educationValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { Basarili = false, Mesaj = "Bilgileri kontrol ediniz.", Hatalar = validationResult.Errors.Select(x => x.ErrorMessage) });
            }

            try
            {
                var userId = GetUserId();
                var result = await _profileService.AddEducationAsync(userId, dto);
                return Ok(new { Basarili = true, Mesaj = "Eğitim bilgisi eklendi.", Data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Basarili = false, Mesaj = "Eğitim eklenirken hata oluştu.", Hata = ex.Message });
            }
        }

        [HttpPut("education/{id}")]
        public async Task<IActionResult> UpdateEducation(Guid id, [FromBody] CreateEducationDto dto)
        {
            dto.BaslangicTarihi = DateTime.SpecifyKind(dto.BaslangicTarihi, DateTimeKind.Utc);
            dto.BitisTarihi = dto.BitisTarihi.HasValue ? DateTime.SpecifyKind(dto.BitisTarihi.Value, DateTimeKind.Utc) : null;

            var validationResult = await _educationValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { Basarili = false, Mesaj = "Bilgileri kontrol ediniz.", Hatalar = validationResult.Errors.Select(x => x.ErrorMessage) });
            }

            try
            {
                var userId = GetUserId();
                var result = await _profileService.UpdateEducationAsync(userId, id, dto);
                return Ok(new { Basarili = true, Mesaj = "Eğitim bilgisi güncellendi.", Data = result });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Basarili = false, Mesaj = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Basarili = false, Mesaj = "Eğitim güncellenirken hata oluştu.", Hata = ex.Message });
            }
        }

        [HttpDelete("education/{id}")]
        public async Task<IActionResult> DeleteEducation(Guid id)
        {
            try
            {
                var userId = GetUserId();
                var result = await _profileService.DeleteEducationAsync(userId, id);
                if (!result)
                {
                    return NotFound(new { Basarili = false, Mesaj = "Eğitim kaydı bulunamadı." });
                }
                return Ok(new { Basarili = true, Mesaj = "Eğitim bilgisi silindi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Basarili = false, Mesaj = "Eğitim silinirken hata oluştu.", Hata = ex.Message });
            }
        }

        // --- EXPERIENCE ---
        [HttpPost("experience")]
        public async Task<IActionResult> AddExperience([FromBody] CreateExperienceDto dto)
        {
            dto.BaslangicTarihi = DateTime.SpecifyKind(dto.BaslangicTarihi, DateTimeKind.Utc);
            dto.BitisTarihi = dto.BitisTarihi.HasValue ? DateTime.SpecifyKind(dto.BitisTarihi.Value, DateTimeKind.Utc) : null;

            var validationResult = await _experienceValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { Basarili = false, Mesaj = "Bilgileri kontrol ediniz.", Hatalar = validationResult.Errors.Select(x => x.ErrorMessage) });
            }

            try
            {
                var userId = GetUserId();
                var result = await _profileService.AddExperienceAsync(userId, dto);
                return Ok(new { Basarili = true, Mesaj = "Deneyim bilgisi eklendi.", Data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Basarili = false, Mesaj = "Deneyim eklenirken hata oluştu.", Hata = ex.Message });
            }
        }

        [HttpPut("experience/{id}")]
        public async Task<IActionResult> UpdateExperience(Guid id, [FromBody] CreateExperienceDto dto)
        {
            dto.BaslangicTarihi = DateTime.SpecifyKind(dto.BaslangicTarihi, DateTimeKind.Utc);
            dto.BitisTarihi = dto.BitisTarihi.HasValue ? DateTime.SpecifyKind(dto.BitisTarihi.Value, DateTimeKind.Utc) : null;

            var validationResult = await _experienceValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { Basarili = false, Mesaj = "Bilgileri kontrol ediniz.", Hatalar = validationResult.Errors.Select(x => x.ErrorMessage) });
            }

            try
            {
                var userId = GetUserId();
                var result = await _profileService.UpdateExperienceAsync(userId, id, dto);
                return Ok(new { Basarili = true, Mesaj = "Deneyim bilgisi güncellendi.", Data = result });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Basarili = false, Mesaj = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Basarili = false, Mesaj = "Deneyim güncellenirken hata oluştu.", Hata = ex.Message });
            }
        }

        [HttpDelete("experience/{id}")]
        public async Task<IActionResult> DeleteExperience(Guid id)
        {
            try
            {
                var userId = GetUserId();
                var result = await _profileService.DeleteExperienceAsync(userId, id);
                if (!result)
                {
                    return NotFound(new { Basarili = false, Mesaj = "Deneyim kaydı bulunamadı." });
                }
                return Ok(new { Basarili = true, Mesaj = "Deneyim bilgisi silindi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Basarili = false, Mesaj = "Deneyim silinirken hata oluştu.", Hata = ex.Message });
            }
        }

        // --- SKILL ---
        [HttpPost("skill")]
        public async Task<IActionResult> AddSkill([FromBody] CreateSkillDto dto)
        {
            var validationResult = await _skillValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { Basarili = false, Mesaj = "Bilgileri kontrol ediniz.", Hatalar = validationResult.Errors.Select(x => x.ErrorMessage) });
            }

            try
            {
                var userId = GetUserId();
                var result = await _profileService.AddSkillAsync(userId, dto);
                return Ok(new { Basarili = true, Mesaj = "Yetenek eklendi.", Data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Basarili = false, Mesaj = "Yetenek eklenirken hata oluştu.", Hata = ex.Message });
            }
        }

        [HttpDelete("skill/{id}")]
        public async Task<IActionResult> DeleteSkill(Guid id)
        {
            try
            {
                var userId = GetUserId();
                var result = await _profileService.DeleteSkillAsync(userId, id);
                if (!result)
                {
                    return NotFound(new { Basarili = false, Mesaj = "Yetenek kaydı bulunamadı." });
                }
                return Ok(new { Basarili = true, Mesaj = "Yetenek silindi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Basarili = false, Mesaj = "Yetenek silinirken hata oluştu.", Hata = ex.Message });
            }
        }

        // --- CERTIFICATE ---
        [HttpPost("certificate")]
        public async Task<IActionResult> AddCertificate([FromBody] CreateCertificateDto dto)
        {
            dto.VerilisTarihi = DateTime.SpecifyKind(dto.VerilisTarihi, DateTimeKind.Utc);

            var validationResult = await _certificateValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { Basarili = false, Mesaj = "Bilgileri kontrol ediniz.", Hatalar = validationResult.Errors.Select(x => x.ErrorMessage) });
            }

            try
            {
                var userId = GetUserId();
                var result = await _profileService.AddCertificateAsync(userId, dto);
                return Ok(new { Basarili = true, Mesaj = "Sertifika eklendi.", Data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Basarili = false,
                    Mesaj = "Deneyim eklenirken hata oluştu.",
                    Hata = ex.Message,
                    InnerException = ex.InnerException?.Message,
                    StackTrace = ex.StackTrace
                });
            }
        }

        [HttpPut("certificate/{id}")]
        public async Task<IActionResult> UpdateCertificate(Guid id, [FromBody] CreateCertificateDto dto)
        {
            dto.VerilisTarihi = DateTime.SpecifyKind(dto.VerilisTarihi, DateTimeKind.Utc);

            var validationResult = await _certificateValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { Basarili = false, Mesaj = "Bilgileri kontrol ediniz.", Hatalar = validationResult.Errors.Select(x => x.ErrorMessage) });
            }

            try
            {
                var userId = GetUserId();
                var result = await _profileService.UpdateCertificateAsync(userId, id, dto);
                return Ok(new { Basarili = true, Mesaj = "Sertifika güncellendi.", Data = result });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Basarili = false, Mesaj = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Basarili = false,
                    Mesaj = "Deneyim eklenirken hata oluştu.",
                    Hata = ex.Message,
                    InnerException = ex.InnerException?.Message,
                    StackTrace = ex.StackTrace
                });
            }
        }

        [HttpDelete("certificate/{id}")]
        public async Task<IActionResult> DeleteCertificate(Guid id)
        {
            try
            {
                var userId = GetUserId();
                var result = await _profileService.DeleteCertificateAsync(userId, id);
                if (!result)
                {
                    return NotFound(new { Basarili = false, Mesaj = "Sertifika kaydı bulunamadı." });
                }
                return Ok(new { Basarili = true, Mesaj = "Sertifika silindi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Basarili = false,
                    Mesaj = "Deneyim eklenirken hata oluştu.",
                    Hata = ex.Message,
                    InnerException = ex.InnerException?.Message,
                    StackTrace = ex.StackTrace
                });
            }
        }

        // --- PASSWORD CHANGE ---
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.CurrentPassword) || string.IsNullOrWhiteSpace(dto.NewPassword))
            {
                return BadRequest(new { Basarili = false, Mesaj = "Lütfen geçerli şifre bilgilerini giriniz." });
            }

            try
            {
                var userId = GetUserId();
                var user = await _userManager.FindByIdAsync(userId.ToString());
                if (user == null)
                {
                    return NotFound(new { Basarili = false, Mesaj = "Kullanıcı bulunamadı." });
                }

                var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
                if (!result.Succeeded)
                {
                    var errors = result.Errors.Select(x => x.Description).ToList();
                    return BadRequest(new { Basarili = false, Mesaj = "Şifre güncellenemedi.", Hatalar = errors });
                }

                return Ok(new { Basarili = true, Mesaj = "Şifreniz başarıyla değiştirildi!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Basarili = false, Mesaj = "Şifre değiştirilirken bir hata oluştu.", Hata = ex.Message });
            }
        }

        // --- DELETE ACCOUNT ---
        [HttpDelete("delete-account")]
        public async Task<IActionResult> DeleteAccount()
        {
            try
            {
                var userId = GetUserId();
                var user = await _userManager.FindByIdAsync(userId.ToString());
                if (user == null)
                {
                    return NotFound(new { Basarili = false, Mesaj = "Kullanıcı bulunamadı." });
                }

                var result = await _userManager.DeleteAsync(user);
                if (!result.Succeeded)
                {
                    var errors = result.Errors.Select(x => x.Description).ToList();
                    return BadRequest(new { Basarili = false, Mesaj = "Hesap silinemedi.", Hatalar = errors });
                }

                return Ok(new { Basarili = true, Mesaj = "Hesabınız kalıcı olarak silindi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Basarili = false, Mesaj = "Hesap silinirken bir hata oluştu.", Hata = ex.Message });
            }
        }

        // --- ADMIN DELETE USER ---
        [HttpDelete("admin/delete-user/{targetUserId:guid}")]
        public async Task<IActionResult> DeleteUserByAdmin(Guid targetUserId)
        {
            try
            {
                var userId = GetUserId();
                var currentUser = await _userManager.FindByIdAsync(userId.ToString());
                if (currentUser == null || currentUser.Email != "admin@cverse.com")
                {
                    return Forbid();
                }

                var targetUser = await _userManager.FindByIdAsync(targetUserId.ToString());
                if (targetUser == null)
                {
                    return NotFound(new { Basarili = false, Mesaj = "Kullanıcı bulunamadı." });
                }

                if (targetUser.Email == "admin@cverse.com")
                {
                    return BadRequest(new { Basarili = false, Mesaj = "Yönetici hesabı silinemez!" });
                }

                // 1. Kullanıcının mesajlarını sil
                var userMessages = await _dbContext.Messages
                    .Where(m => m.SenderId == targetUserId)
                    .ToListAsync();
                _dbContext.Messages.RemoveRange(userMessages);

                // 2. Kullanıcının konusmalarını sil (iki taraftan)
                var userConversations = await _dbContext.Conversations
                    .Where(c => c.User1Id == targetUserId || c.User2Id == targetUserId)
                    .ToListAsync();
                // Konusmalardaki diger mesajlari sil
                foreach (var conv in userConversations)
                {
                    var convMessages = await _dbContext.Messages
                        .Where(m => m.ConversationId == conv.Id)
                        .ToListAsync();
                    _dbContext.Messages.RemoveRange(convMessages);
                }
                _dbContext.Conversations.RemoveRange(userConversations);

                // 3. Kullanıcının bildirimleri sil (alan ve gonderen)
                var userNotifs = await _dbContext.Notifications
                    .Where(n => n.UserId == targetUserId || n.TriggeredById == targetUserId)
                    .ToListAsync();
                _dbContext.Notifications.RemoveRange(userNotifs);

                // 4. Kullanıcının takip kayitlarini sil
                var userFollows = await _dbContext.Follows
                    .Where(f => f.FollowerId == targetUserId || f.FollowedId == targetUserId)
                    .ToListAsync();
                _dbContext.Follows.RemoveRange(userFollows);

                // 5. Kullanıcının gonderilerindeki yorum begenilerini sil
                var userPostIds = await _dbContext.Posts
                    .Where(p => p.UserId == targetUserId)
                    .Select(p => p.Id)
                    .ToListAsync();

                var postCommentIds = await _dbContext.Comments
                    .Where(c => userPostIds.Contains(c.PostId))
                    .Select(c => c.Id)
                    .ToListAsync();

                var commentLikes = await _dbContext.CommentLikes
                    .Where(cl => postCommentIds.Contains(cl.CommentId) || cl.UserId == targetUserId)
                    .ToListAsync();
                _dbContext.CommentLikes.RemoveRange(commentLikes);

                // 6. Kullanıcının kendi yorumlarindaki begeniyi sil
                var userCommentIds = await _dbContext.Comments
                    .Where(c => c.UserId == targetUserId)
                    .Select(c => c.Id)
                    .ToListAsync();
                var userCommentLikes = await _dbContext.CommentLikes
                    .Where(cl => userCommentIds.Contains(cl.CommentId))
                    .ToListAsync();
                _dbContext.CommentLikes.RemoveRange(userCommentLikes);

                // 7. Gonderi yorumlarini sil
                var postComments = await _dbContext.Comments
                    .Where(c => userPostIds.Contains(c.PostId) || c.UserId == targetUserId)
                    .ToListAsync();
                _dbContext.Comments.RemoveRange(postComments);

                // 8. Gonderi begenilerini sil
                var postLikes = await _dbContext.Likes
                    .Where(l => l.UserId == targetUserId || userPostIds.Contains(l.PostId))
                    .ToListAsync();
                _dbContext.Likes.RemoveRange(postLikes);

                // 9. Gonderi resimlerini sil
                var postImages = await _dbContext.PostImages
                    .Where(pi => userPostIds.Contains(pi.PostId))
                    .ToListAsync();
                _dbContext.PostImages.RemoveRange(postImages);

                // 10. Gonderileri sil
                var userPosts = await _dbContext.Posts
                    .Where(p => p.UserId == targetUserId)
                    .ToListAsync();
                _dbContext.Posts.RemoveRange(userPosts);

                // 11. Diger kullanicilarin bu kullanicinin gonderilerine attigi begeni/yorumlari sil
                var likesOnUserContent = await _dbContext.Likes
                    .Where(l => l.UserId == targetUserId)
                    .ToListAsync();
                _dbContext.Likes.RemoveRange(likesOnUserContent);

                // 12. Degisiklikleri kaydet
                await _dbContext.SaveChangesAsync();

                // 13. Son olarak Identity kullanicisini sil (profil, egitim, deneyim, sertifika, yetenek cascade ile silinir)
                var result = await _userManager.DeleteAsync(targetUser);
                if (!result.Succeeded)
                {
                    var errors = result.Errors.Select(x => x.Description).ToList();
                    return BadRequest(new { Basarili = false, Mesaj = "Kullanıcı silinemedi.", Hatalar = errors });
                }

                return Ok(new { Basarili = true, Mesaj = $"{targetUser.AdSoyad} adlı kullanıcı ve tüm verileri başarıyla silindi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Basarili = false, Mesaj = "Kullanıcı silinirken bir hata oluştu.", Hata = ex.Message, Inner = ex.InnerException?.Message });
            }
        }
    }
}