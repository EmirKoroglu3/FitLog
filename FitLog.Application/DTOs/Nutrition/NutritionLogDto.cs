namespace FitLog.Application.DTOs.Nutrition;

/// <summary>
/// Beslenme kaydı DTO'ları.
/// </summary>
public class NutritionLogDto
{
    public Guid Id { get; set; }
    public DateTime Date { get; set; }
    public int Calories { get; set; }
    public decimal Protein { get; set; }
    public decimal? Carbohydrates { get; set; }
    public decimal? Fat { get; set; }
    public string? MealType { get; set; }
    public string? Notes { get; set; }
}

public class CreateNutritionLogRequest
{
    public DateTime Date { get; set; }
    public int Calories { get; set; }
    public decimal Protein { get; set; }
    public decimal? Carbohydrates { get; set; }
    public decimal? Fat { get; set; }
    public string? MealType { get; set; }
    public string? Notes { get; set; }
}

public class UpdateNutritionLogRequest
{
    public DateTime Date { get; set; }
    public int Calories { get; set; }
    public decimal Protein { get; set; }
    public decimal? Carbohydrates { get; set; }
    public decimal? Fat { get; set; }
    public string? MealType { get; set; }
    public string? Notes { get; set; }
}

