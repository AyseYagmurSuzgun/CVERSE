using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Cverse.Application.DTOs;

namespace Cverse.Application.Interfaces
{
    public interface IChatService
    {
        Task<MessageDto> SendMessageAsync(Guid senderId, Guid receiverId, string content);
        Task<IEnumerable<ConversationDto>> GetConversationsAsync(Guid userId);
        Task<IEnumerable<MessageDto>> GetMessagesAsync(Guid conversationId, Guid userId);
        Task<Guid> GetOrCreateConversationAsync(Guid user1Id, Guid user2Id);
        Task<bool> MarkMessagesAsReadAsync(Guid conversationId, Guid userId);
    }
}
