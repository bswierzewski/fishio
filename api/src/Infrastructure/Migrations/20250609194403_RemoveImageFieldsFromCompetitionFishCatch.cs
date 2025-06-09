using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveImageFieldsFromCompetitionFishCatch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImagePublicId",
                table: "CompetitionFishCatches");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "CompetitionFishCatches");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImagePublicId",
                table: "CompetitionFishCatches",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "CompetitionFishCatches",
                type: "character varying(2048)",
                maxLength: 2048,
                nullable: true);
        }
    }
}
