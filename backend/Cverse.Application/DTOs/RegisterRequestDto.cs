namespace Cverse.Application.DTOs
{
    public class RegisterRequestDto
    {
        public string AdSoyad { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string KullaniciAdi { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}
