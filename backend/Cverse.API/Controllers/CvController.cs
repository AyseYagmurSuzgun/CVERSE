using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Cverse.Application.Interfaces;
using Cverse.Application.DTOs;

namespace Cverse.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CvController : BaseApiController
    {
        private readonly ICvAnalysisService _cvAnalysisService;

        public CvController(ICvAnalysisService cvAnalysisService)
        {
            _cvAnalysisService = cvAnalysisService;
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        [HttpPost("upload")]
        public async Task<IActionResult> UploadCv(IFormFile file)
        {
            var userId = GetUserId();
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { Basarili = false, Mesaj = "Lütfen geçerli bir PDF dosyası yükleyin." });
                }

                var result = await _cvAnalysisService.AnalyzeCvAsync(userId, file);
                return Ok(new { Basarili = true, Mesaj = "Özgeçmiş başarıyla analiz edildi.", Data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Basarili = false, Mesaj = ex.Message });
            }
        }

        [HttpGet("my-analyses")]
        public async Task<IActionResult> GetMyAnalyses()
        {
            var userId = GetUserId();
            try
            {
                var list = await _cvAnalysisService.GetMyAnalysesAsync(userId);
                return Ok(new { Basarili = true, Mesaj = "Geçmiş analizler başarıyla listelendi.", Data = list });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Basarili = false, Mesaj = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAnalysisById(Guid id)
        {
            var userId = GetUserId();
            try
            {
                var result = await _cvAnalysisService.GetAnalysisByIdAsync(userId, id);
                return Ok(new { Basarili = true, Mesaj = "Analiz sonucu başarıyla getirildi.", Data = result });
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

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAnalysis(Guid id)
        {
            var userId = GetUserId();
            try
            {
                var success = await _cvAnalysisService.DeleteAnalysisAsync(userId, id);
                if (!success) return NotFound(new { Basarili = false, Mesaj = "Silinmek istenen analiz bulunamadı." });
                return Ok(new { Basarili = true, Mesaj = "Analiz geçmişten başarıyla silindi." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Basarili = false, Mesaj = ex.Message });
            }
        }
    }
}