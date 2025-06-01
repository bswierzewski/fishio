using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CategoryDefinitions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    IsGlobal = table.Column<bool>(type: "boolean", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Metric = table.Column<string>(type: "text", nullable: false),
                    CalculationLogic = table.Column<string>(type: "text", nullable: false),
                    EntityType = table.Column<string>(type: "text", nullable: false),
                    RequiresSpecificFishSpecies = table.Column<bool>(type: "boolean", nullable: false),
                    AllowManualWinnerAssignment = table.Column<bool>(type: "boolean", nullable: false),
                    Created = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CategoryDefinitions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FishSpecies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FishSpecies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ClerkUserId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Email = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: true),
                    ImageUrl = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    Created = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Fisheries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    ImagePublicId = table.Column<string>(type: "text", nullable: true),
                    Location = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    UserId = table.Column<int>(type: "integer", nullable: true),
                    Created = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Fisheries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Fisheries_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Competitions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    StartTime = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    EndTime = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Rules = table.Column<string>(type: "text", nullable: true),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    ImagePublicId = table.Column<string>(type: "text", nullable: true),
                    ResultsToken = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    OrganizerId = table.Column<int>(type: "integer", nullable: false),
                    FisheryId = table.Column<int>(type: "integer", nullable: false),
                    Created = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Competitions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Competitions_Fisheries_FisheryId",
                        column: x => x.FisheryId,
                        principalTable: "Fisheries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Competitions_Users_OrganizerId",
                        column: x => x.OrganizerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FisheryFishSpecies",
                columns: table => new
                {
                    FisheryId = table.Column<int>(type: "integer", nullable: false),
                    FishSpeciesId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FisheryFishSpecies", x => new { x.FisheryId, x.FishSpeciesId });
                    table.ForeignKey(
                        name: "FK_FisheryFishSpecies_FishSpecies_FishSpeciesId",
                        column: x => x.FishSpeciesId,
                        principalTable: "FishSpecies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FisheryFishSpecies_Fisheries_FisheryId",
                        column: x => x.FisheryId,
                        principalTable: "Fisheries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LogbookEntries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: false),
                    ImagePublicId = table.Column<string>(type: "text", nullable: true),
                    CatchTime = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LengthCm = table.Column<decimal>(type: "numeric(7,2)", precision: 7, scale: 2, nullable: true),
                    WeightKg = table.Column<decimal>(type: "numeric(7,3)", precision: 7, scale: 3, nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    FishSpeciesId = table.Column<int>(type: "integer", nullable: true),
                    FisheryId = table.Column<int>(type: "integer", nullable: true),
                    Created = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LogbookEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LogbookEntries_FishSpecies_FishSpeciesId",
                        column: x => x.FishSpeciesId,
                        principalTable: "FishSpecies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_LogbookEntries_Fisheries_FisheryId",
                        column: x => x.FisheryId,
                        principalTable: "Fisheries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_LogbookEntries_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CompetitionCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CompetitionId = table.Column<int>(type: "integer", nullable: false),
                    CategoryDefinitionId = table.Column<int>(type: "integer", nullable: false),
                    FishSpeciesId = table.Column<int>(type: "integer", nullable: true),
                    CustomNameOverride = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    CustomDescriptionOverride = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    IsPrimaryScoring = table.Column<bool>(type: "boolean", nullable: false),
                    MaxWinnersToDisplay = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    Created = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompetitionCategories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompetitionCategories_CategoryDefinitions_CategoryDefinitio~",
                        column: x => x.CategoryDefinitionId,
                        principalTable: "CategoryDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompetitionCategories_Competitions_CompetitionId",
                        column: x => x.CompetitionId,
                        principalTable: "Competitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CompetitionCategories_FishSpecies_FishSpeciesId",
                        column: x => x.FishSpeciesId,
                        principalTable: "FishSpecies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "CompetitionParticipants",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CompetitionId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: true),
                    GuestName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    GuestIdentifier = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Role = table.Column<int>(type: "integer", nullable: false),
                    AddedByOrganizer = table.Column<bool>(type: "boolean", nullable: false),
                    Created = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompetitionParticipants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompetitionParticipants_Competitions_CompetitionId",
                        column: x => x.CompetitionId,
                        principalTable: "Competitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CompetitionParticipants_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CompetitionFishCatches",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CompetitionId = table.Column<int>(type: "integer", nullable: false),
                    ParticipantId = table.Column<int>(type: "integer", nullable: false),
                    JudgeId = table.Column<int>(type: "integer", nullable: false),
                    FishSpeciesId = table.Column<int>(type: "integer", nullable: false),
                    LengthCm = table.Column<decimal>(type: "numeric(7,2)", precision: 7, scale: 2, nullable: true),
                    WeightKg = table.Column<decimal>(type: "numeric(7,3)", precision: 7, scale: 3, nullable: true),
                    ImageUrl = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: false),
                    ImagePublicId = table.Column<string>(type: "text", nullable: true),
                    CatchTime = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Created = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompetitionFishCatches", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompetitionFishCatches_CompetitionParticipants_ParticipantId",
                        column: x => x.ParticipantId,
                        principalTable: "CompetitionParticipants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompetitionFishCatches_Competitions_CompetitionId",
                        column: x => x.CompetitionId,
                        principalTable: "Competitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CompetitionFishCatches_FishSpecies_FishSpeciesId",
                        column: x => x.FishSpeciesId,
                        principalTable: "FishSpecies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompetitionFishCatches_Users_JudgeId",
                        column: x => x.JudgeId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "CategoryDefinitions",
                columns: new[] { "Id", "AllowManualWinnerAssignment", "CalculationLogic", "Created", "CreatedBy", "Description", "EntityType", "IsGlobal", "LastModified", "LastModifiedBy", "Metric", "Name", "RequiresSpecificFishSpecies", "Type" },
                values: new object[,]
                {
                    { 1, false, "MaxValue", new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "Zwycięzcą zostaje uczestnik, który złowił rybę o największej długości.", "FishCatch", true, new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "LengthCm", "Najdłuższa Ryba (Indywidualnie)", false, "MainScoring" },
                    { 2, false, "MaxValue", new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "Zwycięzcą zostaje uczestnik, który złowił rybę o największej wadze.", "FishCatch", true, new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "WeightKg", "Najcięższa Ryba (Indywidualnie)", false, "MainScoring" },
                    { 3, false, "SumValue", new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "Zwycięzcą zostaje uczestnik z największą sumą długości wszystkich swoich złowionych ryb.", "ParticipantAggregateCatches", true, new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "LengthCm", "Suma Długości Złowionych Ryb", false, "MainScoring" },
                    { 4, false, "SumValue", new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "Zwycięzcą zostaje uczestnik z największą sumą wag wszystkich swoich złowionych ryb.", "ParticipantAggregateCatches", true, new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "WeightKg", "Suma Wag Złowionych Ryb", false, "MainScoring" },
                    { 5, false, "SumValue", new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "Zwycięzcą zostaje uczestnik, który złowił najwięcej ryb (sztuk).", "ParticipantAggregateCatches", true, new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "FishCount", "Liczba Złowionych Ryb", false, "MainScoring" },
                    { 10, true, "ManualAssignment", new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "Nagroda za największą (najdłuższą lub najcięższą - do ustalenia przez organizatora) rybę zawodów, niezależnie od gatunku.", "FishCatch", true, new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "NotApplicable", "Największa Ryba Zawodów (Gatunek Dowolny)", false, "SpecialAchievement" },
                    { 11, true, "ManualAssignment", new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "Nagroda za największą rybę wybranego gatunku (np. Największy Szczupak). Gatunek wybierany przy dodawaniu kategorii do zawodów.", "FishCatch", true, new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "NotApplicable", "Największa Ryba Określonego Gatunku", true, "SpecialAchievement" },
                    { 12, false, "FirstOccurrence", new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "Nagroda dla uczestnika, który jako pierwszy zarejestruje połów.", "FishCatch", true, new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "TimeOfCatch", "Pierwsza Złowiona Ryba Zawodów", false, "SpecialAchievement" },
                    { 13, true, "ManualAssignment", new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "Nagroda dla najmłodszego uczestnika, który złowił jakąkolwiek rybę.", "ParticipantProfile", true, new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "NotApplicable", "Najmłodszy Uczestnik z Rybą", false, "FunChallenge" },
                    { 14, false, "MaxValue", new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "Nagroda dla uczestnika, który złowił najwięcej różnych gatunków ryb.", "ParticipantAggregateCatches", true, new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, "SpeciesVariety", "Największa Różnorodność Gatunków", false, "SpecialAchievement" }
                });

            migrationBuilder.InsertData(
                table: "FishSpecies",
                columns: new[] { "Id", "ImageUrl", "Name" },
                values: new object[,]
                {
                    { 1, "/images/fish/amur-bialy.gif", "Amur biały" },
                    { 2, "/images/fish/bolen.gif", "Boleń" },
                    { 3, "/images/fish/brzana.gif", "Brzana" },
                    { 4, "/images/fish/certa.gif", "Certa" },
                    { 5, "/images/fish/jaz.gif", "Jaź" },
                    { 6, "/images/fish/jelec.gif", "Jelec" },
                    { 7, "/images/fish/karas.gif", "Karaś" },
                    { 8, "/images/fish/karas-srebrzysty.gif", "Karaś srebrzysty" },
                    { 9, "/images/fish/karp.gif", "Karp" },
                    { 10, "/images/fish/kielb.gif", "Kiełb" },
                    { 11, "/images/fish/klen.gif", "Kleń" },
                    { 12, "/images/fish/koza.gif", "Koza" },
                    { 13, "/images/fish/krap.gif", "Krap" },
                    { 14, "/images/fish/leszcz.gif", "Leszcz" },
                    { 15, "/images/fish/lin.gif", "Lin" },
                    { 16, "/images/fish/lipien.gif", "Lipień" },
                    { 17, "/images/fish/mietus.gif", "Miętus" },
                    { 18, "/images/fish/okon.gif", "Okoń" },
                    { 19, "/images/fish/piskorz.gif", "Piskorz" },
                    { 20, "/images/fish/ploc.gif", "Płoć" },
                    { 21, "/images/fish/pstrag-potokowy.gif", "Pstrąg potokowy" },
                    { 22, "/images/fish/pstrag-zrodlany.gif", "Pstrąg źródlany" },
                    { 23, "/images/fish/rozanka.gif", "Różanka" },
                    { 24, "/images/fish/sandacz.gif", "Sandacz" },
                    { 25, "/images/fish/sliz.gif", "Śliż" },
                    { 26, "/images/fish/strzebla-potokowa.gif", "Strzebla potokowa" },
                    { 27, "/images/fish/sum.gif", "Sum" },
                    { 28, "/images/fish/swinka.gif", "Świńka" },
                    { 29, "/images/fish/szczupak.gif", "Szczupak" },
                    { 30, "/images/fish/tolpyga-biala.gif", "Tołpyga biała" },
                    { 31, "/images/fish/ukleja.gif", "Ukleja" },
                    { 32, "/images/fish/wegorz-europejski.gif", "Węgorz europejski" },
                    { 33, "/images/fish/wzdrega.gif", "Wzdręga" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_CategoryDefinitions_Name",
                table: "CategoryDefinitions",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_CompetitionCategories_CategoryDefinitionId",
                table: "CompetitionCategories",
                column: "CategoryDefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_CompetitionCategories_CompetitionId_SortOrder",
                table: "CompetitionCategories",
                columns: new[] { "CompetitionId", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_CompetitionCategories_FishSpeciesId",
                table: "CompetitionCategories",
                column: "FishSpeciesId");

            migrationBuilder.CreateIndex(
                name: "IX_CompetitionFishCatches_CompetitionId",
                table: "CompetitionFishCatches",
                column: "CompetitionId");

            migrationBuilder.CreateIndex(
                name: "IX_CompetitionFishCatches_FishSpeciesId",
                table: "CompetitionFishCatches",
                column: "FishSpeciesId");

            migrationBuilder.CreateIndex(
                name: "IX_CompetitionFishCatches_JudgeId",
                table: "CompetitionFishCatches",
                column: "JudgeId");

            migrationBuilder.CreateIndex(
                name: "IX_CompetitionFishCatches_ParticipantId",
                table: "CompetitionFishCatches",
                column: "ParticipantId");

            migrationBuilder.CreateIndex(
                name: "IX_CompetitionParticipants_CompetitionId_GuestIdentifier",
                table: "CompetitionParticipants",
                columns: new[] { "CompetitionId", "GuestIdentifier" },
                unique: true,
                filter: "\"GuestIdentifier\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CompetitionParticipants_CompetitionId_UserId_Role",
                table: "CompetitionParticipants",
                columns: new[] { "CompetitionId", "UserId", "Role" },
                unique: true,
                filter: "\"UserId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CompetitionParticipants_UserId",
                table: "CompetitionParticipants",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Competitions_FisheryId",
                table: "Competitions",
                column: "FisheryId");

            migrationBuilder.CreateIndex(
                name: "IX_Competitions_OrganizerId",
                table: "Competitions",
                column: "OrganizerId");

            migrationBuilder.CreateIndex(
                name: "IX_Competitions_ResultsToken",
                table: "Competitions",
                column: "ResultsToken",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Fisheries_UserId",
                table: "Fisheries",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_FisheryFishSpecies_FishSpeciesId",
                table: "FisheryFishSpecies",
                column: "FishSpeciesId");

            migrationBuilder.CreateIndex(
                name: "IX_FishSpecies_Name",
                table: "FishSpecies",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LogbookEntries_FisheryId",
                table: "LogbookEntries",
                column: "FisheryId");

            migrationBuilder.CreateIndex(
                name: "IX_LogbookEntries_FishSpeciesId",
                table: "LogbookEntries",
                column: "FishSpeciesId");

            migrationBuilder.CreateIndex(
                name: "IX_LogbookEntries_UserId",
                table: "LogbookEntries",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_ClerkUserId",
                table: "Users",
                column: "ClerkUserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true,
                filter: "\"Email\" IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CompetitionCategories");

            migrationBuilder.DropTable(
                name: "CompetitionFishCatches");

            migrationBuilder.DropTable(
                name: "FisheryFishSpecies");

            migrationBuilder.DropTable(
                name: "LogbookEntries");

            migrationBuilder.DropTable(
                name: "CategoryDefinitions");

            migrationBuilder.DropTable(
                name: "CompetitionParticipants");

            migrationBuilder.DropTable(
                name: "FishSpecies");

            migrationBuilder.DropTable(
                name: "Competitions");

            migrationBuilder.DropTable(
                name: "Fisheries");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
