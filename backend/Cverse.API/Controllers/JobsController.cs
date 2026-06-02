using System;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Cverse.Application.Interfaces;
using Cverse.Application.DTOs;

using Microsoft.EntityFrameworkCore;

namespace Cverse.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class JobsController : BaseApiController
    {
        private readonly IJobService _jobService;
        private readonly Cverse.Persistence.Context.AppDbContext _context;

        public JobsController(IJobService jobService, Cverse.Persistence.Context.AppDbContext context)
        {
            _jobService = jobService;
            _context = context;
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        [HttpGet]
        public async Task<IActionResult> GetJobs()
        {
            var userId = GetUserId();
            try
            {
                var jobs = await _jobService.GetJobsAsync(userId);
                return Ok(new { Basarili = true, Mesaj = "İş ilanları başarıyla getirildi.", Data = jobs });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Basarili = false, Mesaj = ex.Message });
            }
        }

        [HttpGet("recommended")]
        public async Task<IActionResult> GetRecommendedJobs()
        {
            var userId = GetUserId();
            try
            {
                var jobs = await _jobService.GetRecommendedJobsAsync(userId);
                return Ok(new { Basarili = true, Mesaj = "Önerilen iş ilanları başarıyla getirildi.", Data = jobs });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Basarili = false, Mesaj = ex.Message });
            }
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchJobs(
            [FromQuery] string? searchTerm,
            [FromQuery] string? location,
            [FromQuery] string? workType,
            [FromQuery] string? experienceLevel)
        {
            var userId = GetUserId();
            try
            {
                var request = new JobSearchRequest
                {
                    SearchTerm = searchTerm,
                    Location = location,
                    WorkType = workType,
                    ExperienceLevel = experienceLevel
                };

                var jobs = await _jobService.SearchJobsAsync(request, userId);
                return Ok(new { Basarili = true, Mesaj = "Arama sonuçları başarıyla getirildi.", Data = jobs });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Basarili = false, Mesaj = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetJobById(Guid id)
        {
            var userId = GetUserId();
            try
            {
                var job = await _jobService.GetJobByIdAsync(id, userId);
                if (job == null)
                {
                    return NotFound(new { Basarili = false, Mesaj = "Aranan iş ilanı bulunamadı." });
                }
                return Ok(new { Basarili = true, Mesaj = "İş ilanı detayı başarıyla getirildi.", Data = job });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Basarili = false, Mesaj = ex.Message });
            }
        }

        [HttpPost("apply/{id}")]
        public async Task<IActionResult> ApplyToJob(Guid id)
        {
            var userId = GetUserId();
            try
            {
                var success = await _jobService.ApplyToJobAsync(id, userId);
                if (!success)
                {
                    return BadRequest(new { Basarili = false, Mesaj = "Bu iş ilanına daha önce başvurdunuz." });
                }
                return Ok(new { Basarili = true, Mesaj = "İş ilanına başarıyla başvuruldu." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Basarili = false, Mesaj = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Basarili = false, Mesaj = ex.Message });
            }
        }

        [HttpGet("applied")]
        public async Task<IActionResult> GetAppliedJobs()
        {
            var userId = GetUserId();
            try
            {
                var applications = await _jobService.GetAppliedJobsAsync(userId);
                return Ok(new { Basarili = true, Mesaj = "Başvurularınız başarıyla getirildi.", Data = applications });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Basarili = false, Mesaj = ex.Message });
            }
        }

        [HttpPut("applications/{id}/status")]
        public async Task<IActionResult> UpdateApplicationStatus(Guid id, [FromBody] string status)
        {
            try
            {
                var success = await _jobService.UpdateApplicationStatusAsync(id, status);
                if (!success)
                {
                    return NotFound(new { Basarili = false, Mesaj = "Başvuru bulunamadı." });
                }
                return Ok(new { Basarili = true, Mesaj = "Başvuru durumu başarıyla güncellendi." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Basarili = false, Mesaj = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteJob(Guid id)
        {
            try
            {
                var userId = GetUserId();
                var user = await _context.Users.FindAsync(userId);
                if (user == null || user.Email != "admin@cverse.com")
                {
                    return Forbid();
                }

                var job = await _context.Jobs.FindAsync(id);
                if (job == null)
                {
                    return NotFound(new { Basarili = false, Mesaj = "İş ilanı bulunamadı." });
                }

                // 1. İlana yapılan başvuruları sil
                var apps = await _context.JobApplications.Where(a => a.JobId == id).ToListAsync();
                _context.JobApplications.RemoveRange(apps);

                // 2. İlanı sil
                _context.Jobs.Remove(job);
                await _context.SaveChangesAsync();

                return Ok(new { Basarili = true, Mesaj = "İş ilanı ve ilişkili tüm başvuruları başarıyla silindi." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Basarili = false, Mesaj = ex.Message });
            }
        }
    }
}
