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
        var logs = await _context.NutritionLogs
            .Where(n => n.UserId == userId && n.Date.Date == date.Date)
            .ToListAsync(cancellationToken);

        return new NutritionSummaryDto
        {
            Date = date,
            TotalCalories = logs.Sum(l => l.Calories),
            TotalProtein = logs.Sum(l => l.Protein),
            TotalCarbohydrates = logs.Sum(l => l.Carbohydrates ?? 0),
            TotalFat = logs.Sum(l => l.Fat ?? 0),
            MealCount = logs.Count
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

