using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cverse.Domain.Entities;

namespace Cverse.Persistence.Configurations
{
    public class ExperienceConfiguration : IEntityTypeConfiguration<Experience>
    {
        public void Configure(EntityTypeBuilder<Experience> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.SirketAdi)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(x => x.Unvan)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(x => x.Konum)
                .HasMaxLength(150);

            builder.Property(x => x.Aciklama)
                .HasMaxLength(2000);

            // 1:N relationship with ApplicationUser
            builder.HasOne(x => x.User)
                .WithMany(x => x.Experiences)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
