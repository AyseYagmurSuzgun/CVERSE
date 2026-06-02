using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using AutoMapper;
using Cverse.Application.DTOs;
using Cverse.Application.Interfaces;
using Cverse.Domain.Entities;

namespace Cverse.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IJwtTokenGenerator _tokenGenerator;
        private readonly IMapper _mapper;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            IJwtTokenGenerator tokenGenerator,
            IMapper mapper)
        {
            _userManager = userManager;
            _tokenGenerator = tokenGenerator;
            _mapper = mapper;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
        {
            // E-posta benzersizlik kontrolü
            var existingEmail = await _userManager.FindByEmailAsync(request.Email);
            if (existingEmail != null)
            {
                return new AuthResponseDto
                {
                    Basarili = false,
                    Mesaj = "Bu e-posta adresi zaten kullanımda.",
                    Hatalar = new List<string> { "E-posta adresi kullanımda." }
                };
            }

            // Kullanıcı adı benzersizlik kontrolü
            var existingUsername = await _userManager.FindByNameAsync(request.KullaniciAdi);
            if (existingUsername != null)
            {
                return new AuthResponseDto
                {
                    Basarili = false,
                    Mesaj = "Bu kullanıcı adı zaten alınmış.",
                    Hatalar = new List<string> { "Kullanıcı adı kullanımda." }
                };
            }

            // Entity eslestirme
            var user = _mapper.Map<ApplicationUser>(request);
            user.OlusturmaTarihi = DateTime.UtcNow;

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(x => x.Description).ToList();
                return new AuthResponseDto
                {
                    Basarili = false,
                    Mesaj = "Kayıt işlemi sırasında bir hata oluştu.",
                    Hatalar = errors
                };
            }

            return new AuthResponseDto
            {
                Basarili = true,
                Mesaj = "Kayıt işlemi başarıyla tamamlandı."
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
        {
            // Email veya KullaniciAdi ile kullaniciyi bul
            ApplicationUser? user = null;
            if (request.EmailOrUsername.Contains("@"))
            {
                user = await _userManager.FindByEmailAsync(request.EmailOrUsername);
            }
            else
            {
                user = await _userManager.FindByNameAsync(request.EmailOrUsername);
            }

            if (user == null)
            {
                return new AuthResponseDto
                {
                    Basarili = false,
                    Mesaj = "Kullanıcı adı, e-posta veya şifre hatalı.",
                    Hatalar = new List<string> { "Kullanıcı bulunamadı veya şifre yanlış." }
                };
            }

            // Sifre dogrulama
            var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);
            if (!isPasswordValid)
            {
                return new AuthResponseDto
                {
                    Basarili = false,
                    Mesaj = "Kullanıcı adı, e-posta veya şifre hatalı.",
                    Hatalar = new List<string> { "Kullanıcı bulunamadı veya şifre yanlış." }
                };
            }

            // JWT ve Refresh Token uretimi
            var token = _tokenGenerator.GenerateToken(user);
            var refreshToken = _tokenGenerator.GenerateRefreshToken();

            // Refresh token veritabanina kaydedilir (7 gün geçerli)
            user.RefreshToken = refreshToken;
            user.RefreshTokenBitisTarihi = DateTime.UtcNow.AddDays(7);
            await _userManager.UpdateAsync(user);

            return new AuthResponseDto
            {
                Basarili = true,
                Token = token,
                RefreshToken = refreshToken,
                TokenBitisTarihi = user.RefreshTokenBitisTarihi,
                Mesaj = "Giriş işlemi başarıyla tamamlandı."
            };
        }

        public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
        {
            // Refresh token ile kullaniciyi bul
            var user = _userManager.Users.FirstOrDefault(x => x.RefreshToken == refreshToken);
            if (user == null || user.RefreshTokenBitisTarihi < DateTime.UtcNow)
            {
                return new AuthResponseDto
                {
                    Basarili = false,
                    Mesaj = "Geçersiz veya süresi dolmuş oturum yenileme anahtarı.",
                    Hatalar = new List<string> { "Geçersiz refresh token." }
                };
            }

            // Yeni tokenlar
            var newAccessToken = _tokenGenerator.GenerateToken(user);
            var newRefreshToken = _tokenGenerator.GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;
            user.RefreshTokenBitisTarihi = DateTime.UtcNow.AddDays(7);
            await _userManager.UpdateAsync(user);

            return new AuthResponseDto
            {
                Basarili = true,
                Token = newAccessToken,
                RefreshToken = newRefreshToken,
                TokenBitisTarihi = user.RefreshTokenBitisTarihi,
                Mesaj = "Oturum başarıyla yenilendi."
            };
        }

        public async Task<bool> LogoutAsync(Guid userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null) return false;

            user.RefreshToken = null;
            user.RefreshTokenBitisTarihi = null;
            var result = await _userManager.UpdateAsync(user);
            return result.Succeeded;
        }

        public async Task<UserDto?> GetCurrentUserAsync(Guid userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null) return null;

            return _mapper.Map<UserDto>(user);
        }
    }
}
