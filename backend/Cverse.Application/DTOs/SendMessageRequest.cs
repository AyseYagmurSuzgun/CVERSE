using System;

namespace Cverse.Application.DTOs
{
    public class SendMessageRequest
    {
        public Guid ReceiverId { get; set; }
        public string Content { get; set; } = null!;
    }
}
