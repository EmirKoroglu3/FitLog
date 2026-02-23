namespace FitLog.Application.DTOs.AiCoach;

/// <summary>
/// AI Coach analiz isteği DTO'su.
/// </summary>
public class AiCoachAnalysisRequestDto
{
    public decimal Height { get; set; }
    public decimal Weight { get; set; }
    public decimal BodyFatPercentage { get; set; }
    public GoalType Goal { get; set; }
    public int WeeklyWorkoutFrequency { get; set; }
}
