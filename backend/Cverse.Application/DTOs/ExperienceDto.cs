using System;

namespace Cverse.Application.DTOs
{
    public class ExperienceDto
    {
        public Guid Id { get; set; }
        public string SirketAdi { get; set; } = null!;
        public string Unvan { get; set; } = null!;
        public string? Konum { get; set; }
        public DateTime BaslangicTarihi { get; set; }
        public DateTime? BitisTarihi { get; set; }
        public bool SuAnBuradaCalisiyorum { get; set; }
        public string? Aciklama { get; set; }
    }

    public class CreateExperienceDto
    {
        public string SirketAdi { get; set; } = null!;
        public string Unvan { get; set; } = null!;
        public string? Konum { get; set; }
        public DateTime BaslangicTarihi { get; set; }
        public DateTime? BitisTarihi { get; set; }
        public bool SuAnBuradaCalisiyorum { get; set; }
        public string? Aciklama { get; set; }
    }
}
