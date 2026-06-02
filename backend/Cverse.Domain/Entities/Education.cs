using System;

namespace Cverse.Domain.Entities
{
    public class Education
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string OkulAdi { get; set; } = null!;
        public string Bolum { get; set; } = null!;
        public DateTime BaslangicTarihi { get; set; }
        public DateTime? BitisTarihi { get; set; }
        public string? Aciklama { get; set; }
        public DateTime OlusturmaTarihi { get; set; } = DateTime.UtcNow;

        // Navigation Property
        public ApplicationUser User { get; set; } = null!;
    }
}
