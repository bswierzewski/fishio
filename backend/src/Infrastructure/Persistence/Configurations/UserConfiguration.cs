using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Fishio.Domain.Entities;
using Fishio.Domain.Enums;

namespace Fishio.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasIndex(u => u.ClerkId)
            .IsUnique();
        builder.Property(u => u.ClerkId)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(u => u.Email)
            .IsUnique();
        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(256)
            .HasConversion(v => v.ToLowerInvariant(), v => v.ToLowerInvariant());

        builder.Property(u => u.ProfileDescription)
            .HasMaxLength(1000);

        builder.Property(u => u.ProfilePictureUrl)
            .HasMaxLength(500);

        builder.Property(u => u.DateOfBirth)
            .HasColumnType("date");

        builder.Property(u => u.Gender)
            .HasConversion<int>()
            .IsRequired(false);

        builder.Property(u => u.Role)
            .HasConversion<int>()
            .IsRequired(false);

        builder.Property(u => u.NotificationsEnabled)
            .IsRequired()
            .HasDefaultValue(true);
    }
}