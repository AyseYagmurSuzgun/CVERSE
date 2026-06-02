using System;

namespace Cverse.Application.DTOs
{
    public class ConversationDto
    {
        public Guid Id { get; set; }
        public DateTime LastMessageAt { get; set; }
        public DateTime CreatedAt { get; set; }
        
        // Other participant information
        public Guid ParticipantId { get; set; }
        public string ParticipantAdSoyad { get; set; } = null!;
        public string? ParticipantProfilFotografiUrl { get; set; }
        public string? ParticipantUnvan { get; set; }
        public bool IsOnline { get; set; }
        public DateTime? LastSeen { get; set; }
        
        // Inbox preview info
        public string? LastMessageContent { get; set; }
        public Guid? LastMessageSenderId { get; set; }
        public int UnreadMessagesCount { get; set; }
    }
}
