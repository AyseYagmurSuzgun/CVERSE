using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FluentValidation;
using Cverse.Application.DTOs;
using Cverse.Application.Interfaces;

namespace Cverse.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IValidator<RegisterRequestDto> _registerValidator;
        private readonly IValidator<LoginRequestDto> _loginValidator;

        public AuthController(
            IAuthService authService,
            IValidator<RegisterRequestDto> registerValidator,
            IValidator<LoginRequestDto> loginValidator)
        {
            _authService = authService;
            _registerValidator = registerValidator;
            _loginValidator = loginValidator;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
        {
            var validationResult = await _registerValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new AuthResponseDto
                {
                    Basarili = false,
                    Mesaj = "Girdiğiniz bilgileri kontrol ediniz.",
                    Hatalar = errors
                });
            }

            var result = await _authService.RegisterAsync(request);
            if (!result.Basarili)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            var validationResult = await _loginValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new AuthResponseDto
                {
                    Basarili = false,
                    Mesaj = "Giriş bilgileri geçersiz.",
                    Hatalar = errors
                });
            }

            var result = await _authService.LoginAsync(request);
            if (!result.Basarili)
            {
                return Unauthorized(result);
            }

            return Ok(result);
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto request)
        {
            if (string.IsNullOrEmpty(request.RefreshToken))
            {
                return BadRequest(new AuthResponseDto
                {
                    Basarili = false,
                    Mesaj = "Oturum yenileme anahtarı boş geçilemez."
                });
            }

            var result = await _authService.RefreshTokenAsync(request.RefreshToken);
            if (!result.Basarili)
            {
                return Unauthorized(result);
            }

            return Ok(result);
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { Basarili = false, Mesaj = "Yetkisiz işlem." });
            }

            var userId = Guid.Parse(userIdClaim.Value);
            var result = await _authService.LogoutAsync(userId);
            if (!result)
            {
                return BadRequest(new { Basarili = false, Mesaj = "Çıkış işlemi başarısız." });
            }

            return Ok(new { Basarili = true, Mesaj = "Başarıyla çıkış yapıldı." });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { Basarili = false, Mesaj = "Yetkisiz işlem." });
            }

            var userId = Guid.Parse(userIdClaim.Value);
            var user = await _authService.GetCurrentUserAsync(userId);
            if (user == null)
            {
                return NotFound(new { Basarili = false, Mesaj = "Kullanıcı bulunamadı." });
            }

            return Ok(new { Basarili = true, Mesaj = "Kullanıcı bilgisi başarıyla getirildi.", Data = user });
        }
    }
}
