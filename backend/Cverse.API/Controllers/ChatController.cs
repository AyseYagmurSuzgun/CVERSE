using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Cverse.Application.DTOs;
using Cverse.Application.Interfaces;

namespace Cverse.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : BaseApiController
    {
        private readonly IChatService _chatService;

        public ChatController(IChatService chatService)
        {
            _chatService = chatService;
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversations()
        {
            var userId = GetUserId();
            var conversations = await _chatService.GetConversationsAsync(userId);
            return Ok(new { Basarili = true, Mesaj = "Konuşmalar başarıyla listelendi.", Data = conversations });
        }

        [HttpGet("conversations/{conversationId}/messages")]
        public async Task<IActionResult> GetMessages(Guid conversationId)
        {
            var userId = GetUserId();
            try
            {
                var messages = await _chatService.GetMessagesAsync(conversationId, userId);
                return Ok(new { Basarili = true, Mesaj = "Mesaj geçmişi başarıyla getirildi.", Data = messages });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Basarili = false, Mesaj = ex.Message });
            }
        }

        [HttpPost("message")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(request.Content))
            {
                return BadRequest(new { Basarili = false, Mesaj = "Mesaj içeriği boş olamaz." });
            }

            if (userId == request.ReceiverId)
            {
                return BadRequest(new { Basarili = false, Mesaj = "Kendinize mesaj gönderemezsiniz." });
            }

            var message = await _chatService.SendMessageAsync(userId, request.ReceiverId, request.Content);
            return Ok(new { Basarili = true, Mesaj = "Mesaj başarıyla gönderildi.", Data = message });
        }

        [HttpPost("conversations/{conversationId}/read")]
        public async Task<IActionResult> MarkMessagesAsRead(Guid conversationId)
        {
            var userId = GetUserId();
            var result = await _chatService.MarkMessagesAsReadAsync(conversationId, userId);
            if (!result)
            {
                return BadRequest(new { Basarili = false, Mesaj = "Konuşma bulunamadı veya yetkisiz işlem." });
            }
            return Ok(new { Basarili = true, Mesaj = "Mesajlar okundu olarak işaretlendi." });
        }

        [HttpPost("conversations/create/{receiverId}")]
        public async Task<IActionResult> CreateConversation(Guid receiverId)
        {
            var userId = GetUserId();
            if (userId == receiverId)
            {
                return BadRequest(new { Basarili = false, Mesaj = "Kendinizle konuşma başlatamazsınız." });
            }

            var conversationId = await _chatService.GetOrCreateConversationAsync(userId, receiverId);
            return Ok(new { Basarili = true, Mesaj = "Sohbet başarıyla oluşturuldu.", Data = new { ConversationId = conversationId } });
        }
    }
}
