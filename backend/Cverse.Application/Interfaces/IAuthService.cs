using System;
using System.Threading.Tasks;
using Cverse.Application.DTOs;

namespace Cverse.Application.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);
        Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
        Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);
        Task<bool> LogoutAsync(Guid userId);
        Task<UserDto?> GetCurrentUserAsync(Guid userId);
    }
}
