using Cverse.Domain.Entities;

namespace Cverse.Application.Interfaces
{
    public interface IJwtTokenGenerator
    {
        string GenerateToken(ApplicationUser user);
        string GenerateRefreshToken();
    }
}
