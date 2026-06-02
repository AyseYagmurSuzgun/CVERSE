using System;
using System.Collections.Generic;

namespace Cverse.Application.DTOs
{
    public class AuthResponseDto
    {
        public bool Basarili { get; set; }
        public string? Token { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime? TokenBitisTarihi { get; set; }
        public string? Mesaj { get; set; }
        public List<string>? Hatalar { get; set; }
    }
}
