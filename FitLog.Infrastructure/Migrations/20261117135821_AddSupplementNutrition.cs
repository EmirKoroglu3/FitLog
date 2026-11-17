using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitLog.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSupplementNutrition : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Calories",
                table: "Supplements",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Carbohydrates",
                table: "Supplements",
                type: "numeric(6,1)",
                precision: 6,
                scale: 1,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Fat",
                table: "Supplements",
                type: "numeric(6,1)",
                precision: 6,
                scale: 1,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Protein",
                table: "Supplements",
                type: "numeric(6,1)",
                precision: 6,
                scale: 1,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Calories",
                table: "Supplements");

            migrationBuilder.DropColumn(
                name: "Carbohydrates",
                table: "Supplements");

            migrationBuilder.DropColumn(
                name: "Fat",
                table: "Supplements");

            migrationBuilder.DropColumn(
                name: "Protein",
                table: "Supplements");
        }
    }
}
