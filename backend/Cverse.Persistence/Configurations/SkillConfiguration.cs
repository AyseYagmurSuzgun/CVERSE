using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cverse.Domain.Entities;

namespace Cverse.Persistence.Configurations
{
    public class SkillConfiguration : IEntityTypeConfiguration<Skill>
    {
        public void Configure(EntityTypeBuilder<Skill> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.YetenekAdi)
                .IsRequired()
                .HasMaxLength(100);

            // 1:N relationship with ApplicationUser
            builder.HasOne(x => x.User)
                .WithMany(x => x.Skills)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
