using System;

namespace Cverse.Application.DTOs
{
    public class NotificationDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Type { get; set; } = null!;
        public string Content { get; set; } = null!;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid? TriggeredById { get; set; }
        public string? TriggeredByAdSoyad { get; set; }
        public string? TriggeredByProfilFotografiUrl { get; set; }
    }
}
