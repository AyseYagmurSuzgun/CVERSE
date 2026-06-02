using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Cverse.Application.Interfaces;

namespace Cverse.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : BaseApiController
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var userId = GetUserId();
            var notifications = await _notificationService.GetUserNotificationsAsync(userId);
            return Ok(new { Basarili = true, Mesaj = "Bildirimler başarıyla listelendi.", Data = notifications });
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = GetUserId();
            var count = await _notificationService.GetUnreadNotificationsCountAsync(userId);
            return Ok(new { Basarili = true, Mesaj = "Okunmamış bildirim sayısı getirildi.", Data = count });
        }

        [HttpPost("{id}/read")]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            var userId = GetUserId();
            var result = await _notificationService.MarkAsReadAsync(id, userId);
            if (!result)
            {
                return BadRequest(new { Basarili = false, Mesaj = "Bildirim bulunamadı veya yetkisiz işlem." });
            }
            return Ok(new { Basarili = true, Mesaj = "Bildirim okundu olarak işaretlendi." });
        }

        [HttpPost("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = GetUserId();
            await _notificationService.MarkAllAsReadAsync(userId);
            return Ok(new { Basarili = true, Mesaj = "Tüm bildirimler okundu olarak işaretlendi." });
        }
    }
}
