using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddParticipantStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "CompetitionParticipants",
                type: "integer",
                nullable: false,
                defaultValue: 1); // Default to Approved (1) for existing participants

            // Update existing participants to Approved status
            migrationBuilder.Sql("UPDATE \"CompetitionParticipants\" SET \"Status\" = 1 WHERE \"Status\" = 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "CompetitionParticipants");
        }
    }
}
