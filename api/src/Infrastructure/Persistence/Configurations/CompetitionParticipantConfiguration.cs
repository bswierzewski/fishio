using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Fishio.Infrastructure.Persistence.Configurations;

public class CompetitionParticipantConfiguration : IEntityTypeConfiguration<CompetitionParticipant>
{
    public void Configure(EntityTypeBuilder<CompetitionParticipant> builder)
    {
        builder.HasKey(cp => cp.Id);

        // Relacja z Competition
        builder.HasOne(cp => cp.Competition)
            .WithMany(c => c.Participants)
            .HasForeignKey(cp => cp.CompetitionId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);

        // Relacja z User (opcjonalna, bo może być gość)
        builder.HasOne(cp => cp.User)
            .WithMany(u => u.CompetitionParticipations)
            .HasForeignKey(cp => cp.UserId)
            .OnDelete(DeleteBehavior.Restrict); // Jeśli User jest usuwany, a jest uczestnikiem, nie pozwól (lub Cascade jeśli to pożądane)

        builder.Property(cp => cp.GuestName).HasMaxLength(200);
        builder.Property(cp => cp.GuestIdentifier).HasMaxLength(100);

        builder.Property(cp => cp.Role).IsRequired();
        builder.Property(cp => cp.AddedByOrganizer).IsRequired();
        builder.Property(cp => cp.Status).IsRequired();

        builder.Property(cp => cp.Sector)
            .HasMaxLength(100);

        builder.Property(cp => cp.Stand)
            .HasMaxLength(50);

        // Unikalny indeks dla (CompetitionId, UserId, Role) jeśli UserId nie jest null - pozwala na wiele ról dla tego samego użytkownika
        builder.HasIndex(cp => new { cp.CompetitionId, cp.UserId, cp.Role })
            .IsUnique()
            .HasFilter("\"UserId\" IS NOT NULL");

        // Unikalny indeks dla (CompetitionId, GuestIdentifier) jeśli GuestIdentifier nie jest null
        builder.HasIndex(cp => new { cp.CompetitionId, cp.GuestIdentifier })
            .IsUnique()
            .HasFilter("\"GuestIdentifier\" IS NOT NULL");


        // Konfiguracja BaseAuditableEntity
        builder.Property(cp => cp.Created).IsRequired();
        builder.Property(cp => cp.LastModified).IsRequired();
    }
}
