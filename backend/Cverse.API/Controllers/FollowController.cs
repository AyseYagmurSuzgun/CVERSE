using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Cverse.Persistence.Context;
using Cverse.Domain.Entities;
using Cverse.Application.Interfaces;

namespace Cverse.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FollowController : BaseApiController
    {
        private readonly AppDbContext _context;
        private readonly INotificationService _notificationService;

        public FollowController(AppDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        [HttpPost("{targetUserId}")]
        public async Task<IActionResult> ToggleFollow(Guid targetUserId)
        {
            var currentUserId = GetUserId();

            if (currentUserId == targetUserId)
            {
                return BadRequest(new { Basarili = false, Mesaj = "Kendinizi takip edemezsiniz." });
            }

            var targetUserExists = await _context.Users.AnyAsync(u => u.Id == targetUserId);
            if (!targetUserExists)
            {
                return NotFound(new { Basarili = false, Mesaj = "Takip edilmek istenen kullanıcı bulunamadı." });
            }

            var existingFollow = await _context.Follows
                .FirstOrDefaultAsync(f => f.FollowerId == currentUserId && f.FollowedId == targetUserId);

            bool isFollowing;
            if (existingFollow != null)
            {
                _context.Follows.Remove(existingFollow);
                isFollowing = false;
            }
            else
            {
                var newFollow = new Follow
                {
                    Id = Guid.NewGuid(),
                    FollowerId = currentUserId,
                    FollowedId = targetUserId,
                    CreatedAt = DateTime.UtcNow
                };
                await _context.Follows.AddAsync(newFollow);
                isFollowing = true;
            }

            await _context.SaveChangesAsync();

            if (isFollowing)
            {
                var follower = await _context.Users.FindAsync(currentUserId);
                await _notificationService.CreateNotificationAsync(
                    targetUserId,
                    "Follow",
                    $"{follower?.AdSoyad ?? "Birisi"} sizi takip etmeye başladı.",
                    currentUserId
                );
            }

            return Ok(new { 
                Basarili = true, 
                Mesaj = isFollowing ? "Kullanıcı takip edildi." : "Takip kaldırıldı.", 
                Data = new { IsFollowing = isFollowing } 
            });
        }

        [HttpGet("discover")]
        public async Task<IActionResult> GetDiscoverUsers()
        {
            var currentUserId = GetUserId();

            // Fetch all users except the current user
            var users = await _context.Users
                .Where(u => u.Id != currentUserId)
                .Select(u => new
                {
                    UserId = u.Id,
                    AdSoyad = u.AdSoyad,
                    UserName = u.UserName,
                    ProfilFotografiUrl = u.ProfilFotografiUrl,
                    KapakFotografiUrl = u.KapakFotografiUrl,
                    Unvan = _context.UserProfiles.Where(p => p.UserId == u.Id).Select(p => p.Unvan).FirstOrDefault(),
                    Bio = _context.UserProfiles.Where(p => p.UserId == u.Id).Select(p => p.Bio).FirstOrDefault(),
                    IsFollowing = _context.Follows.Any(f => f.FollowerId == currentUserId && f.FollowedId == u.Id)
                })
                .ToListAsync();

            return Ok(new { Basarili = true, Mesaj = "Keşfet kullanıcıları listelendi.", Data = users });
        }
    }
}
