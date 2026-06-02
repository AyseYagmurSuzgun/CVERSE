using System;

namespace Cverse.Domain.Entities
{
    public class Certificate
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string SertifikaAdi { get; set; } = null!;
        public string VerenKurum { get; set; } = null!;
        public DateTime VerilisTarihi { get; set; }
        public string? SertifikaUrl { get; set; }
        public string? SertifikaId { get; set; }
        public DateTime OlusturmaTarihi { get; set; } = DateTime.UtcNow;

        // Navigation Property
        public ApplicationUser User { get; set; } = null!;
    }
}
