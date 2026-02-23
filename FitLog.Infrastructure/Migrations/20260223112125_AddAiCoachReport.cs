using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitLog.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAiCoachReport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AiCoachReports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    AnalysisDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TrainingSummary = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    NutritionSummary = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    AiRecommendationText = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: false),
                    CalculatedVolumeJson = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AiCoachReports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AiCoachReports_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AiCoachReports_UserId",
                table: "AiCoachReports",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AiCoachReports");
        }
    }
}
