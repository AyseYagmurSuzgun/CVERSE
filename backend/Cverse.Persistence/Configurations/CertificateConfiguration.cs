using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cverse.Domain.Entities;

namespace Cverse.Persistence.Configurations
{
    public class CertificateConfiguration : IEntityTypeConfiguration<Certificate>
    {
        public void Configure(EntityTypeBuilder<Certificate> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.SertifikaAdi)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(x => x.VerenKurum)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(x => x.SertifikaUrl)
                .HasMaxLength(500);

            builder.Property(x => x.SertifikaId)
                .HasMaxLength(100);

            // 1:N relationship with ApplicationUser
            builder.HasOne(x => x.User)
                .WithMany(x => x.Certificates)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
