using FitLog.Domain.Common;

namespace FitLog.Domain.Entities;

/// <summary>
/// AI Coach analiz raporu entity'si.
/// Kullanıcının antrenman ve beslenme verilerine göre oluşturulan raporu saklar.
/// </summary>
public class AiCoachReport : BaseEntity
{
    public Guid UserId { get; set; }
    public DateTime AnalysisDate { get; set; }
    public string TrainingSummary { get; set; } = string.Empty;
    public string NutritionSummary { get; set; } = string.Empty;
    public string AiRecommendationText { get; set; } = string.Empty;
    public string CalculatedVolumeJson { get; set; } = string.Empty;
}
