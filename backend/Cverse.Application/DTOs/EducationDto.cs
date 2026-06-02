using System;

namespace Cverse.Application.DTOs
{
    public class EducationDto
    {
        public Guid Id { get; set; }
        public string OkulAdi { get; set; } = null!;
        public string Bolum { get; set; } = null!;
        public DateTime BaslangicTarihi { get; set; }
        public DateTime? BitisTarihi { get; set; }
        public string? Aciklama { get; set; }
    }

    public class CreateEducationDto
    {
        public string OkulAdi { get; set; } = null!;
        public string Bolum { get; set; } = null!;
        public DateTime BaslangicTarihi { get; set; }
        public DateTime? BitisTarihi { get; set; }
        public string? Aciklama { get; set; }
    }
}
