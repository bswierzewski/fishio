using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoveGuestRoleAndAllowMultipleRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CompetitionParticipants_CompetitionId_UserId",
                table: "CompetitionParticipants");

            migrationBuilder.CreateIndex(
                name: "IX_CompetitionParticipants_CompetitionId_UserId_Role",
                table: "CompetitionParticipants",
                columns: new[] { "CompetitionId", "UserId", "Role" },
                unique: true,
                filter: "\"UserId\" IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CompetitionParticipants_CompetitionId_UserId_Role",
                table: "CompetitionParticipants");

            migrationBuilder.CreateIndex(
                name: "IX_CompetitionParticipants_CompetitionId_UserId",
                table: "CompetitionParticipants",
                columns: new[] { "CompetitionId", "UserId" },
                unique: true,
                filter: "\"UserId\" IS NOT NULL");
        }
    }
}
