using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cverse.Domain.Entities;

namespace Cverse.Persistence.Configurations
{
    public class EducationConfiguration : IEntityTypeConfiguration<Education>
    {
        public void Configure(EntityTypeBuilder<Education> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.OkulAdi)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(x => x.Bolum)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(x => x.Aciklama)
                .HasMaxLength(1000);

            // 1:N relationship with ApplicationUser
            builder.HasOne(x => x.User)
                .WithMany(x => x.Educations)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
