namespace FitLog.Application.DTOs.AiCoach;

/// <summary>
/// AI Coach analiz yanıt DTO'su.
/// </summary>
public class AiCoachAnalysisResponseDto
{
    public string TrainingAdvice { get; set; } = string.Empty;
    public string NutritionAdvice { get; set; } = string.Empty;
    public string BulkCutRecommendation { get; set; } = string.Empty;
    public string MacroSuggestion { get; set; } = string.Empty;
    public string PlateauWarning { get; set; } = string.Empty;
    public string RawAiRecommendation { get; set; } = string.Empty;
    public AiCoachCalculatedMetricsDto CalculatedMetrics { get; set; } = new();
}

/// <summary>
/// Hesaplanan metrikler (volume, kalori ortalaması vb.).
/// </summary>
public class AiCoachCalculatedMetricsDto
{
    public Dictionary<string, decimal> WeeklyVolumePerExercise { get; set; } = new();
    public decimal AverageWeeklyCalories { get; set; }
    public decimal AverageWeeklyProtein { get; set; }
    public decimal ProteinPercent { get; set; }
    public decimal CarbsPercent { get; set; }
    public decimal FatPercent { get; set; }
    public bool ProgressiveOverloadDetected { get; set; }
    public bool PlateauDetected { get; set; }
    public List<string> PlateauExercises { get; set; } = new();
}
