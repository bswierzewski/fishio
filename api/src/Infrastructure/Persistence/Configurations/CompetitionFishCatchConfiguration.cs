using Fishio.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Fishio.Infrastructure.Persistence.Configurations;

public class CompetitionFishCatchConfiguration : IEntityTypeConfiguration<CompetitionFishCatch>
{
    public void Configure(EntityTypeBuilder<CompetitionFishCatch> builder)
    {
        builder.HasKey(cfc => cfc.Id);

        // Relacja z Competition
        builder.HasOne(cfc => cfc.Competition)
            .WithMany(c => c.FishCatches)
            .HasForeignKey(cfc => cfc.CompetitionId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);

        // Relacja z CompetitionParticipant
        builder.HasOne(cfc => cfc.Participant)
            .WithMany(cp => cp.FishCatches)
            .HasForeignKey(cfc => cfc.ParticipantId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict); // Nie usuwaj połowu, jeśli uczestnik jest usuwany (lub Cascade)

        // Relacja z User (Judge)
        builder.HasOne(cfc => cfc.Judge)
            .WithMany(u => u.JudgedFishCatches)
            .HasForeignKey(cfc => cfc.JudgeId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict); // Nie usuwaj połowu, jeśli sędzia jest usuwany

        // Relacja z FishSpecies
        builder.HasOne(cfc => cfc.FishSpecies)
            .WithMany(fs => fs.CompetitionFishCatches) // Dodaj ICollection<CompetitionFishCatch> CompetitionFishCatches w FishSpecies
            .HasForeignKey(cfc => cfc.FishSpeciesId)
            .IsRequired(false) // FishSpecies is now optional - judges may register multiple fish without specifying species
            .OnDelete(DeleteBehavior.Restrict);

        // Konfiguracja Value Object FishLength
        builder.Property(cfc => cfc.Length)
            .HasConversion(
                l => l == null ? (decimal?)null : l.Value,
                value => value == null ? null : new FishLength(value.Value))
            .HasColumnName("LengthCm")
            .HasPrecision(7, 2);

        // Konfiguracja Value Object FishWeight
        builder.Property(cfc => cfc.Weight)
            .HasConversion(
                w => w == null ? (decimal?)null : w.Value,
                value => value == null ? null : new FishWeight(value.Value))
            .HasColumnName("WeightKg")
            .HasPrecision(7, 3);

        builder.Property(cfc => cfc.CatchTime).IsRequired();

        // Konfiguracja BaseAuditableEntity
        builder.Property(cfc => cfc.Created).IsRequired();
        builder.Property(cfc => cfc.LastModified).IsRequired();
    }
}
