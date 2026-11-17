using FitLog.Application.DTOs.Nutrition;
using FitLog.Application.Interfaces;
using FitLog.Application.Services;
using FitLog.Domain.Entities;
using FitLog.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FitLog.Infrastructure.Services;

/// <summary>
/// Nutrition servisi implementasyonu.
/// </summary>
public class NutritionService : INutritionService
{
    private readonly FitLogDbContext _context;
    private readonly IUnitOfWork _unitOfWork;

    public NutritionService(FitLogDbContext context, IUnitOfWork unitOfWork)
    {
        _context = context;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<NutritionLogDto>> GetUserNutritionLogsAsync(Guid userId, DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default)
    {
        var query = _context.NutritionLogs.Where(n => n.UserId == userId);

        if (startDate.HasValue)
            query = query.Where(n => n.Date >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(n => n.Date <= endDate.Value);

        var logs = await query
            .OrderByDescending(n => n.Date)
            .ToListAsync(cancellationToken);

        return logs.Select(MapToDto).ToList();
    }

    public async Task<NutritionLogDto?> GetNutritionLogByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var log = await _unitOfWork.NutritionLogs.GetByIdAsync(id, cancellationToken);
        return log == null ? null : MapToDto(log);
    }

    public async Task<NutritionLogDto> CreateNutritionLogAsync(Guid userId, CreateNutritionLogRequest request, CancellationToken cancellationToken = default)
    {
        var log = new NutritionLog
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Date = request.Date,
            Calories = request.Calories,
            Protein = request.Protein,
            Carbohydrates = request.Carbohydrates,
            Fat = request.Fat,
            MealType = request.MealType,
            Notes = request.Notes
        };

        await _unitOfWork.NutritionLogs.AddAsync(log, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(log);
    }

    public async Task<NutritionLogDto?> UpdateNutritionLogAsync(Guid id, UpdateNutritionLogRequest request, CancellationToken cancellationToken = default)
    {
        var log = await _unitOfWork.NutritionLogs.GetByIdAsync(id, cancellationToken);
        if (log == null) return null;

        log.Date = request.Date;
        log.Calories = request.Calories;
        log.Protein = request.Protein;
        log.Carbohydrates = request.Carbohydrates;
        log.Fat = request.Fat;
        log.MealType = request.MealType;
        log.Notes = request.Notes;

        await _unitOfWork.NutritionLogs.UpdateAsync(log, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(log);
    }

    public async Task<bool> DeleteNutritionLogAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var log = await _unitOfWork.NutritionLogs.GetByIdAsync(id, cancellationToken);
        if (log == null) return false;

        await _unitOfWork.NutritionLogs.DeleteAsync(log, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<NutritionSummaryDto> GetDailySummaryAsync(Guid userId, DateTime date, CancellationToken cancellationToken = default)
    {
        var dayStart = DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);
        return await GetSummaryForRangeAsync(userId, dayStart, dayStart.AddDays(1), cancellationToken);
    }

    public async Task<NutritionSummaryDto> GetSummaryForRangeAsync(Guid userId, DateTime start, DateTime end, CancellationToken cancellationToken = default)
    {
        var from = start.ToUniversalTime();
        var to = end.ToUniversalTime();

        var logs = await _context.NutritionLogs
            .Where(n => n.UserId == userId && n.Date >= from && n.Date < to)
            .ToListAsync(cancellationToken);

        // Supplements marked as taken in the range count like food (whey, gainer, ...).
        // Intakes are stored per local calendar day, while the client sends its local day as a UTC
        // range (Turkey: 17 Nov = 16 Nov 21:00Z .. 17 Nov 21:00Z). Shifting by 12 h lands inside
        // the intended local day for any offset between UTC-11 and UTC+12.
        var firstDay = DateOnly.FromDateTime(from.AddHours(12));
        var endDay = DateOnly.FromDateTime(to.AddHours(12));
        if (endDay <= firstDay) endDay = firstDay.AddDays(1);
        var taken = await (
                from i in _context.SupplementIntakes
                join s in _context.Supplements on i.SupplementId equals s.Id
                where i.UserId == userId && i.Date >= firstDay && i.Date < endDay
                select new { s.Calories, s.Protein, s.Carbohydrates, s.Fat })
            .ToListAsync(cancellationToken);

        var supCalories = taken.Sum(t => t.Calories ?? 0);
        var supProtein = taken.Sum(t => t.Protein ?? 0);
        var supCarbs = taken.Sum(t => t.Carbohydrates ?? 0);
        var supFat = taken.Sum(t => t.Fat ?? 0);

        return new NutritionSummaryDto
        {
            Date = from,
            TotalCalories = logs.Sum(l => l.Calories) + supCalories,
            TotalProtein = logs.Sum(l => l.Protein) + supProtein,
            TotalCarbohydrates = logs.Sum(l => l.Carbohydrates ?? 0) + supCarbs,
            TotalFat = logs.Sum(l => l.Fat ?? 0) + supFat,
            MealCount = logs.Count,
            SupplementCalories = supCalories,
            SupplementProtein = supProtein,
            SupplementCarbohydrates = supCarbs,
            SupplementFat = supFat,
            SupplementCount = taken.Count(t => t.Calories > 0 || t.Protein > 0 || t.Carbohydrates > 0 || t.Fat > 0)
        };
    }

    private static NutritionLogDto MapToDto(NutritionLog log) => new()
    {
        Id = log.Id,
        Date = log.Date,
        Calories = log.Calories,
        Protein = log.Protein,
        Carbohydrates = log.Carbohydrates,
        Fat = log.Fat,
        MealType = log.MealType,
        Notes = log.Notes
    };
}

