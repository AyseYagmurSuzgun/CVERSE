using System;

namespace Cverse.Application.DTOs
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public string AdSoyad { get; set; } = null!;
        public string KullaniciAdi { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? ProfilFotografiUrl { get; set; }
    }
}
