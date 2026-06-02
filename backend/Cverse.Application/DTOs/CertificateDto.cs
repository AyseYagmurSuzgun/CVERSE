using System;

namespace Cverse.Application.DTOs
{
    public class CertificateDto
    {
        public Guid Id { get; set; }
        public string SertifikaAdi { get; set; } = null!;
        public string VerenKurum { get; set; } = null!;
        public DateTime VerilisTarihi { get; set; }
        public string? SertifikaUrl { get; set; }
        public string? SertifikaId { get; set; }
    }

    public class CreateCertificateDto
    {
        public string SertifikaAdi { get; set; } = null!;
        public string VerenKurum { get; set; } = null!;
        public DateTime VerilisTarihi { get; set; }
        public string? SertifikaUrl { get; set; }
        public string? SertifikaId { get; set; }
    }
}
