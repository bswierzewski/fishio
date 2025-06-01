using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddImagePublicIdColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImagePublicId",
                table: "LogbookEntries",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImagePublicId",
                table: "Fisheries",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImagePublicId",
                table: "Competitions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImagePublicId",
                table: "CompetitionFishCatches",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImagePublicId",
                table: "LogbookEntries");

            migrationBuilder.DropColumn(
                name: "ImagePublicId",
                table: "Fisheries");

            migrationBuilder.DropColumn(
                name: "ImagePublicId",
                table: "Competitions");

            migrationBuilder.DropColumn(
                name: "ImagePublicId",
                table: "CompetitionFishCatches");
        }
    }
}
