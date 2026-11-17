namespace FitLog.Application.DTOs.AiCoach;

/// <summary>One finding of the coach: what we saw, why it matters, what to do.</summary>
public class CoachInsightDto
{
    /// <summary>training | nutrition | body | recovery</summary>
    public string Category { get; set; } = "training";
    /// <summary>good | info | warning</summary>
    public string Severity { get; set; } = "info";
    public string Title { get; set; } = string.Empty;
    /// <summary>The numbers behind the finding, e.g. "Tahmini 1RM 92 → 101 kg (4 hafta)".</summary>
    public string? Metric { get; set; }
    public string Detail { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
}

/// <summary>Daily targets derived from the profile (Mifflin-St Jeor) and goal.</summary>
public class CoachTargetsDto
{
    public int Bmr { get; set; }
    public int Tdee { get; set; }
    public int Calories { get; set; }
    public int ProteinG { get; set; }
    public int CarbsG { get; set; }
    public int FatG { get; set; }
}

public class CoachStatsDto
{
    public decimal SessionsPerWeek { get; set; }
    public int LoggedNutritionDays { get; set; }
    public int AverageDailyCalories { get; set; }
    public int AverageDailyProtein { get; set; }
    public decimal ProteinPerKg { get; set; }
    /// <summary>kg per week over the measured period (negative = losing).</summary>
    public decimal? WeightChangePerWeek { get; set; }
    public decimal BodyWeightKg { get; set; }
}
