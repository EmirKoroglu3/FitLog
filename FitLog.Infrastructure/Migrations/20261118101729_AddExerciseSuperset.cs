using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitLog.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddExerciseSuperset : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "SupersetWithNext",
                table: "Exercises",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SupersetWithNext",
                table: "Exercises");
        }
    }
}
