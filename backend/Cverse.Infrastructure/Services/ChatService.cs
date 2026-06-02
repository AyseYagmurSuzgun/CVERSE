using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Cverse.Application.DTOs;
using Cverse.Application.Interfaces;
using Cverse.Domain.Entities;
using Cverse.Persistence.Context;
using Cverse.Infrastructure.SignalR;

namespace Cverse.Infrastructure.Services
{
    public class ChatService : IChatService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly IConnectionManager _connectionManager;
        private readonly INotificationService _notificationService;

        public ChatService(
            AppDbContext context, 
            IMapper mapper, 
            IHubContext<ChatHub> hubContext, 
            IConnectionManager connectionManager,
            INotificationService notificationService)
        {
            _context = context;
            _mapper = mapper;
            _hubContext = hubContext;
            _connectionManager = connectionManager;
            _notificationService = notificationService;
        }

        public async Task<Guid> GetOrCreateConversationAsync(Guid user1Id, Guid user2Id)
        {
            // Find existing conversation (in either participant order)
            var conversation = await _context.Conversations
                .FirstOrDefaultAsync(c => 
                    (c.User1Id == user1Id && c.User2Id == user2Id) ||
                    (c.User1Id == user2Id && c.User2Id == user1Id));

            if (conversation != null)
            {
                return conversation.Id;
            }

            // Create a new conversation
            var newConversation = new Conversation
                {
                    Id = Guid.NewGuid(),
                    User1Id = user1Id,
                    User2Id = user2Id,
                    CreatedAt = DateTime.UtcNow,
                    LastMessageAt = DateTime.UtcNow
                };

            _context.Conversations.Add(newConversation);
            await _context.SaveChangesAsync();

            return newConversation.Id;
        }

        public async Task<MessageDto> SendMessageAsync(Guid senderId, Guid receiverId, string content)
        {
            var conversationId = await GetOrCreateConversationAsync(senderId, receiverId);

            var message = new Message
            {
                Id = Guid.NewGuid(),
                ConversationId = conversationId,
                SenderId = senderId,
                ReceiverId = receiverId,
                Content = content,
                IsRead = false,
                SentAt = DateTime.UtcNow
            };

            _context.Messages.Add(message);

            // Update last message timestamp on the conversation
            var conversation = await _context.Conversations.FindAsync(conversationId);
            if (conversation != null)
            {
                conversation.LastMessageAt = message.SentAt;
            }

            await _context.SaveChangesAsync();

            var messageDto = _mapper.Map<MessageDto>(message);

            // Dispatch message via SignalR ChatHub to both participants
            await _hubContext.Clients.User(senderId.ToString()).SendAsync("OnMessageReceived", messageDto);
            await _hubContext.Clients.User(receiverId.ToString()).SendAsync("OnMessageReceived", messageDto);

            // Create database persistent notification and deliver via NotificationHub
            var senderUser = await _context.Users.FindAsync(senderId);
            var senderName = senderUser?.AdSoyad ?? "Birisi";
            
            await _notificationService.CreateNotificationAsync(
                receiverId, 
                "Message", 
                $"{senderName} size bir mesaj gönderdi: \"{(content.Length > 30 ? content.Substring(0, 27) + "..." : content)}\"", 
                senderId
            );

            return messageDto;
        }

        public async Task<IEnumerable<ConversationDto>> GetConversationsAsync(Guid userId)
        {
            var conversations = await _context.Conversations
                .Include(c => c.User1).ThenInclude(u => u.Profile)
                .Include(c => c.User2).ThenInclude(u => u.Profile)
                .Include(c => c.Messages)
                .Where(c => c.User1Id == userId || c.User2Id == userId)
                .OrderByDescending(c => c.LastMessageAt)
                .ToListAsync();

            var list = new List<ConversationDto>();

            foreach (var c in conversations)
            {
                var otherUser = c.User1Id == userId ? c.User2 : c.User1;
                var unreadCount = c.Messages.Count(m => m.ReceiverId == userId && !m.IsRead);
                var lastMsg = c.Messages.OrderByDescending(m => m.SentAt).FirstOrDefault();

                list.Add(new ConversationDto
                {
                    Id = c.Id,
                    LastMessageAt = c.LastMessageAt,
                    CreatedAt = c.CreatedAt,
                    ParticipantId = otherUser.Id,
                    ParticipantAdSoyad = otherUser.AdSoyad,
                    ParticipantProfilFotografiUrl = otherUser.ProfilFotografiUrl,
                    ParticipantUnvan = otherUser.Profile?.Unvan,
                    IsOnline = _connectionManager.IsUserOnline(otherUser.Id),
                    LastSeen = otherUser.LastSeen,
                    LastMessageContent = lastMsg?.Content,
                    LastMessageSenderId = lastMsg?.SenderId,
                    UnreadMessagesCount = unreadCount
                });
            }

            return list;
        }

        public async Task<IEnumerable<MessageDto>> GetMessagesAsync(Guid conversationId, Guid userId)
        {
            var messages = await _context.Messages
                .Where(m => m.ConversationId == conversationId)
                .OrderBy(m => m.SentAt)
                .ToListAsync();

            return _mapper.Map<IEnumerable<MessageDto>>(messages);
        }

        public async Task<bool> MarkMessagesAsReadAsync(Guid conversationId, Guid userId)
        {
            var conversation = await _context.Conversations
                .FirstOrDefaultAsync(c => c.Id == conversationId && (c.User1Id == userId || c.User2Id == userId));

            if (conversation == null) return false;

            var unreadMessages = await _context.Messages
                .Where(m => m.ConversationId == conversationId && m.ReceiverId == userId && !m.IsRead)
                .ToListAsync();

            if (!unreadMessages.Any()) return true;

            foreach (var m in unreadMessages)
            {
                m.IsRead = true;
            }

            await _context.SaveChangesAsync();

            // Notify the other participant that their sent messages have been read (Blue Tick)
            var otherUserId = conversation.User1Id == userId ? conversation.User2Id : conversation.User1Id;
            await _hubContext.Clients.User(otherUserId.ToString()).SendAsync("OnMessagesRead", conversationId, userId);

            return true;
        }
    }
}
