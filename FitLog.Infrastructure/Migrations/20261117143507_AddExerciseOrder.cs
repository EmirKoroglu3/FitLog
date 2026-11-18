using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitLog.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddExerciseOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Order",
                table: "Exercises",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            // Keep the order users already see: number existing exercises per day by creation time
            migrationBuilder.Sql(@"
                UPDATE ""Exercises"" e
                SET ""Order"" = r.rn - 1
                FROM (
                    SELECT ""Id"", ROW_NUMBER() OVER (PARTITION BY ""WorkoutDayId"" ORDER BY ""CreatedDate"", ""Id"") AS rn
                    FROM ""Exercises""
                ) r
                WHERE e.""Id"" = r.""Id"";");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Order",
                table: "Exercises");
        }
    }
}
