using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Changeincategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "CategoryDefinitions",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "CategoryDefinitions",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "CategoryDefinitions",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "CategoryDefinitions",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "CategoryDefinitions",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.UpdateData(
                table: "CategoryDefinitions",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CalculationLogic", "Description", "EntityType", "Name" },
                values: new object[] { "SumValue", "Zwycięzcą zostaje uczestnik z największą długością wszystkich swoich złowionych ryb.", "ParticipantAggregateCatches", "Długość złowionych ryb" });

            migrationBuilder.UpdateData(
                table: "CategoryDefinitions",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CalculationLogic", "Description", "EntityType", "Name" },
                values: new object[] { "SumValue", "Zwycięzcą zostaje uczestnik z największą wagą wszystkich swoich złowionych ryb.", "ParticipantAggregateCatches", "Waga złowionych ryb" });

            migrationBuilder.UpdateData(
                table: "CategoryDefinitions",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Description", "Metric", "Name" },
                values: new object[] { "Zwycięzcą zostaje uczestnik, który złowił najwięcej ryb (sztuk).", "FishCount", "Liczba Złowionych Ryb" });

            migrationBuilder.UpdateData(
                table: "CategoryDefinitions",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "AllowManualWinnerAssignment", "CalculationLogic", "Description", "EntityType", "Name", "Type" },
                values: new object[] { true, "MaxValue", "Nagroda za najcięższą rybę zawodów, niezależnie od gatunku.", "FishCatch", "Najcięższa ryba zawodów", "SpecialAchievement" });

            migrationBuilder.UpdateData(
                table: "CategoryDefinitions",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "AllowManualWinnerAssignment", "CalculationLogic", "Description", "EntityType", "Metric", "Name", "Type" },
                values: new object[] { true, "MaxValue", "Nagroda za najdłuższą rybę zawodów, niezależnie od gatunku.", "FishCatch", "LengthCm", "Najdłuższa ryba zawodów", "SpecialAchievement" });

            migrationBuilder.InsertData(
                table: "CategoryDefinitions",
                columns: new[] { "Id", "AllowManualWinnerAssignment", "CalculationLogic", "Created", "CreatedBy", "Description", "EntityType", "IsGlobal", "LastModified", "LastModifiedBy", "Metric", "Name", "RequiresSpecificFishSpecies", "Type" },
                values: new object[,]
                {
                    { 6, true, "MaxValue", new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "Nagroda za największą rybę wybranego gatunku (np. Największy Szczupak). Gatunek wybierany przy dodawaniu kategorii do zawodów.", "FishCatch", true, new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "LengthCm", "Najdłuższa ryba określonego gatunku", true, "SpecialAchievement" },
                    { 7, true, "MaxValue", new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "Nagroda za największą rybę wybranego gatunku (np. Największy Karp). Gatunek wybierany przy dodawaniu kategorii do zawodów.", "FishCatch", true, new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "WeightKg", "Najcięższa ryba określonego gatunku", true, "SpecialAchievement" },
                    { 8, false, "MaxValue", new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "Nagroda dla uczestnika, który złowił najwięcej różnych gatunków ryb.", "ParticipantAggregateCatches", true, new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "SpeciesVariety", "Największa Różnorodność Gatunków", false, "SpecialAchievement" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "CategoryDefinitions",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "CategoryDefinitions",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "CategoryDefinitions",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.UpdateData(
                table: "CategoryDefinitions",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CalculationLogic", "Description", "EntityType", "Name" },
                values: new object[] { "MaxValue", "Zwycięzcą zostaje uczestnik, który złowił rybę o największej długości.", "FishCatch", "Najdłuższa Ryba (Indywidualnie)" });

            migrationBuilder.UpdateData(
                table: "CategoryDefinitions",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CalculationLogic", "Description", "EntityType", "Name" },
                values: new object[] { "MaxValue", "Zwycięzcą zostaje uczestnik, który złowił rybę o największej wadze.", "FishCatch", "Najcięższa Ryba (Indywidualnie)" });

            migrationBuilder.UpdateData(
                table: "CategoryDefinitions",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Description", "Metric", "Name" },
                values: new object[] { "Zwycięzcą zostaje uczestnik z największą sumą długości wszystkich swoich złowionych ryb.", "LengthCm", "Suma Długości Złowionych Ryb" });

            migrationBuilder.UpdateData(
                table: "CategoryDefinitions",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "AllowManualWinnerAssignment", "CalculationLogic", "Description", "EntityType", "Name", "Type" },
                values: new object[] { false, "SumValue", "Zwycięzcą zostaje uczestnik z największą sumą wag wszystkich swoich złowionych ryb.", "ParticipantAggregateCatches", "Suma Wag Złowionych Ryb", "MainScoring" });

            migrationBuilder.UpdateData(
                table: "CategoryDefinitions",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "AllowManualWinnerAssignment", "CalculationLogic", "Description", "EntityType", "Metric", "Name", "Type" },
                values: new object[] { false, "SumValue", "Zwycięzcą zostaje uczestnik, który złowił najwięcej ryb (sztuk).", "ParticipantAggregateCatches", "FishCount", "Liczba Złowionych Ryb", "MainScoring" });

            migrationBuilder.InsertData(
                table: "CategoryDefinitions",
                columns: new[] { "Id", "AllowManualWinnerAssignment", "CalculationLogic", "Created", "CreatedBy", "Description", "EntityType", "IsGlobal", "LastModified", "LastModifiedBy", "Metric", "Name", "RequiresSpecificFishSpecies", "Type" },
                values: new object[,]
                {
                    { 10, true, "ManualAssignment", new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "Nagroda za największą (najdłuższą lub najcięższą - do ustalenia przez organizatora) rybę zawodów, niezależnie od gatunku.", "FishCatch", true, new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "NotApplicable", "Największa Ryba Zawodów (Gatunek Dowolny)", false, "SpecialAchievement" },
                    { 11, true, "ManualAssignment", new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "Nagroda za największą rybę wybranego gatunku (np. Największy Szczupak). Gatunek wybierany przy dodawaniu kategorii do zawodów.", "FishCatch", true, new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "NotApplicable", "Największa Ryba Określonego Gatunku", true, "SpecialAchievement" },
                    { 12, false, "FirstOccurrence", new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "Nagroda dla uczestnika, który jako pierwszy zarejestruje połów.", "FishCatch", true, new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "TimeOfCatch", "Pierwsza Złowiona Ryba Zawodów", false, "SpecialAchievement" },
                    { 13, true, "ManualAssignment", new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "Nagroda dla najmłodszego uczestnika, który złowił jakąkolwiek rybę.", "ParticipantProfile", true, new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "NotApplicable", "Najmłodszy Uczestnik z Rybą", false, "FunChallenge" },
                    { 14, false, "MaxValue", new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "Nagroda dla uczestnika, który złowił najwięcej różnych gatunków ryb.", "ParticipantAggregateCatches", true, new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "SpeciesVariety", "Największa Różnorodność Gatunków", false, "SpecialAchievement" }
                });
        }
    }
}
