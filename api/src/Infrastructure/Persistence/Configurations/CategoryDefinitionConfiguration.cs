using Fishio.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Fishio.Infrastructure.Persistence.Configurations;

public class CategoryDefinitionConfiguration : IEntityTypeConfiguration<CategoryDefinition>
{
    public void Configure(EntityTypeBuilder<CategoryDefinition> builder)
    {
        builder.HasKey(cd => cd.Id);

        builder.Property(cd => cd.Name)
            .IsRequired()
            .HasMaxLength(150);
        builder.HasIndex(cd => cd.Name).IsUnique(false); // Nazwa może nie być unikalna globalnie, jeśli np. użytkownicy tworzą swoje

        builder.Property(cd => cd.Description)
            .HasMaxLength(1000);

        builder.Property(cd => cd.IsGlobal).IsRequired();

        // Konfiguracja BaseAuditableEntity
        builder.Property(cd => cd.Created).IsRequired();
        builder.Property(cd => cd.LastModified).IsRequired();

        builder.Property(cd => cd.Type)
            .HasConversion<string>();

        builder.Property(cd => cd.Metric)
            .HasConversion<string>();

        builder.Property(cd => cd.CalculationLogic)
            .HasConversion<string>();

        builder.Property(cd => cd.EntityType)
            .HasConversion<string>();

        // --- HasData ---
        builder.HasData(
            // --- GŁÓWNE KATEGORIE PUNKTACYJNE ---
            new CategoryDefinition(
                name: "Długość złowionych ryb",
                description: "Zwycięzcą zostaje uczestnik z największą długością wszystkich swoich złowionych ryb.",
                isGlobal: true,
                type: CategoryType.MainScoring,
                metric: CategoryMetric.LengthCm,
                calculationLogic: CategoryCalculationLogic.SumValue,
                entityType: CategoryEntityType.ParticipantAggregateCatches,
                requiresSpecificFishSpecies: false,
                allowManualWinnerAssignment: false
            )
            { Id = 1 },

            new CategoryDefinition(
                name: "Waga złowionych ryb",
                description: "Zwycięzcą zostaje uczestnik z największą wagą wszystkich swoich złowionych ryb.",
                isGlobal: true,
                type: CategoryType.MainScoring,
                metric: CategoryMetric.WeightKg,
                calculationLogic: CategoryCalculationLogic.SumValue,
                entityType: CategoryEntityType.ParticipantAggregateCatches,
                requiresSpecificFishSpecies: false,
                allowManualWinnerAssignment: false
            )
            { Id = 2 },

            new CategoryDefinition(
                name: "Liczba Złowionych Ryb",
                description: "Zwycięzcą zostaje uczestnik, który złowił najwięcej ryb (sztuk).",
                isGlobal: true,
                type: CategoryType.MainScoring,
                metric: CategoryMetric.FishCount,
                calculationLogic: CategoryCalculationLogic.SumValue,
                entityType: CategoryEntityType.ParticipantAggregateCatches,
                requiresSpecificFishSpecies: false,
                allowManualWinnerAssignment: false
            )
            { Id = 3 },

            // --- KATEGORIE SPECJALNE / OSIĄGNIĘCIA ---
            new CategoryDefinition(
                name: "Najcięższa ryba zawodów",
                description: "Nagroda za najcięższą rybę zawodów, niezależnie od gatunku.",
                isGlobal: true,
                type: CategoryType.SpecialAchievement,
                metric: CategoryMetric.WeightKg,
                calculationLogic: CategoryCalculationLogic.MaxValue,
                entityType: CategoryEntityType.FishCatch,
                requiresSpecificFishSpecies: false,
                allowManualWinnerAssignment: true
            )
            { Id = 4 },

            new CategoryDefinition(
                name: "Najdłuższa ryba zawodów",
                description: "Nagroda za najdłuższą rybę zawodów, niezależnie od gatunku.",
                isGlobal: true,
                type: CategoryType.SpecialAchievement,
                metric: CategoryMetric.LengthCm,
                calculationLogic: CategoryCalculationLogic.MaxValue,
                entityType: CategoryEntityType.FishCatch,
                requiresSpecificFishSpecies: false,
                allowManualWinnerAssignment: true
            )
            { Id = 5 },

            new CategoryDefinition(
                name: "Najdłuższa ryba określonego gatunku",
                description: "Nagroda za największą rybę wybranego gatunku.",
                isGlobal: true,
                type: CategoryType.SpecialAchievement,
                metric: CategoryMetric.LengthCm,
                calculationLogic: CategoryCalculationLogic.MaxValue,
                entityType: CategoryEntityType.FishCatch,
                requiresSpecificFishSpecies: true,
                allowManualWinnerAssignment: true
            )
            { Id = 6 },

            new CategoryDefinition(
                name: "Najcięższa ryba określonego gatunku",
                description: "Nagroda za największą rybę wybranego gatunku.",
                isGlobal: true,
                type: CategoryType.SpecialAchievement,
                metric: CategoryMetric.WeightKg,
                calculationLogic: CategoryCalculationLogic.MaxValue,
                entityType: CategoryEntityType.FishCatch,
                requiresSpecificFishSpecies: true,
                allowManualWinnerAssignment: true
            )
            { Id = 7 },

            new CategoryDefinition(
                name: "Największa Różnorodność Gatunków",
                description: "Nagroda za największą różnorodność gatunków.",
                isGlobal: true,
                type: CategoryType.SpecialAchievement,
                metric: CategoryMetric.SpeciesVariety,
                calculationLogic: CategoryCalculationLogic.MaxValue,
                entityType: CategoryEntityType.ParticipantAggregateCatches,
                requiresSpecificFishSpecies: false,
                allowManualWinnerAssignment: false
            )
            { Id = 8 }
        );
    }
}
