using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Updatecompetitionscategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "CategoryDefinitions",
                keyColumn: "Id",
                keyValue: 6,
                column: "Description",
                value: "Nagroda za największą rybę wybranego gatunku.");

            migrationBuilder.UpdateData(
                table: "CategoryDefinitions",
                keyColumn: "Id",
                keyValue: 7,
                column: "Description",
                value: "Nagroda za największą rybę wybranego gatunku.");

            migrationBuilder.UpdateData(
                table: "CategoryDefinitions",
                keyColumn: "Id",
                keyValue: 8,
                column: "Description",
                value: "Nagroda za największą różnorodność gatunków.");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "CategoryDefinitions",
                keyColumn: "Id",
                keyValue: 6,
                column: "Description",
                value: "Nagroda za największą rybę wybranego gatunku (np. Największy Szczupak). Gatunek wybierany przy dodawaniu kategorii do zawodów.");

            migrationBuilder.UpdateData(
                table: "CategoryDefinitions",
                keyColumn: "Id",
                keyValue: 7,
                column: "Description",
                value: "Nagroda za największą rybę wybranego gatunku (np. Największy Karp). Gatunek wybierany przy dodawaniu kategorii do zawodów.");

            migrationBuilder.UpdateData(
                table: "CategoryDefinitions",
                keyColumn: "Id",
                keyValue: 8,
                column: "Description",
                value: "Nagroda dla uczestnika, który złowił najwięcej różnych gatunków ryb.");
        }
    }
}
