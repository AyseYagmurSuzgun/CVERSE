using System;

namespace Cverse.Domain.Entities
{
    public class Experience
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string SirketAdi { get; set; } = null!;
        public string Unvan { get; set; } = null!;
        public string? Konum { get; set; }
        public DateTime BaslangicTarihi { get; set; }
        public DateTime? BitisTarihi { get; set; }
        public bool SuAnBuradaCalisiyorum { get; set; }
        public string? Aciklama { get; set; }
        public DateTime OlusturmaTarihi { get; set; } = DateTime.UtcNow;

        // Navigation Property
        public ApplicationUser User { get; set; } = null!;
    }
}
