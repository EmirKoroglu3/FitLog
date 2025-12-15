using FitLog.Application.DTOs.Nutrition;

namespace FitLog.Application.Services;

/// <summary>
/// Nutrition servisi interface'i.
/// </summary>
public interface INutritionService
{
    Task<List<NutritionLogDto>> GetUserNutritionLogsAsync(Guid userId, DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default);
    Task<NutritionLogDto?> GetNutritionLogByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<NutritionLogDto> CreateNutritionLogAsync(Guid userId, CreateNutritionLogRequest request, CancellationToken cancellationToken = default);
    Task<NutritionLogDto?> UpdateNutritionLogAsync(Guid id, UpdateNutritionLogRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteNutritionLogAsync(Guid id, CancellationToken cancellationToken = default);
    Task<NutritionSummaryDto> GetDailySummaryAsync(Guid userId, DateTime date, CancellationToken cancellationToken = default);
}

/// <summary>
/// Günlük beslenme özeti DTO'su.
/// </summary>
public class NutritionSummaryDto
{
    public DateTime Date { get; set; }
    public int TotalCalories { get; set; }
    public decimal TotalProtein { get; set; }
    public decimal TotalCarbohydrates { get; set; }
    public decimal TotalFat { get; set; }
    public int MealCount { get; set; }
}

