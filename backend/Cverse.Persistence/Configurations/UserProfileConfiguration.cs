using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cverse.Domain.Entities;

namespace Cverse.Persistence.Configurations
{
    public class UserProfileConfiguration : IEntityTypeConfiguration<UserProfile>
    {
        public void Configure(EntityTypeBuilder<UserProfile> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Bio)
                .HasMaxLength(1000);

            builder.Property(x => x.Unvan)
                .HasMaxLength(150);

            builder.Property(x => x.Konum)
                .HasMaxLength(150);

            //builder.Property(x => x.KapakFotografiUrl)
            //    .HasMaxLength(500);

            builder.Property(x => x.LinkedInUrl)
                .HasMaxLength(256);

            builder.Property(x => x.GitHubUrl)
                .HasMaxLength(256);

            builder.Property(x => x.TwitterUrl)
                .HasMaxLength(256);

            builder.Property(x => x.WebsiteUrl)
                .HasMaxLength(256);

            // 1:1 relationship with ApplicationUser
            builder.HasOne(x => x.User)
                .WithOne(x => x.Profile)
                .HasForeignKey<UserProfile>(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
