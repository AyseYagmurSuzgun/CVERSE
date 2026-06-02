using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cverse.Domain.Entities;

namespace Cverse.Persistence.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<ApplicationUser>
    {
        public void Configure(EntityTypeBuilder<ApplicationUser> builder)
        {
            builder.Property(x => x.AdSoyad)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.ProfilFotografiUrl)
                .HasMaxLength(500);

            builder.Property(x => x.RefreshToken)
                .HasMaxLength(256);
        }
    }
}
