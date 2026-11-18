using FitLog.Application.DTOs.Tracking;
using FitLog.Application.Services;
using FitLog.Domain.Entities;
using FitLog.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FitLog.Infrastructure.Services.Tracking;

public class GoalService : IGoalService
{
    private readonly FitLogDbContext _db;

    public GoalService(FitLogDbContext db) => _db = db;

    public async Task<List<FitnessGoalDto>> GetGoalsAsync(Guid userId, CancellationToken ct = default)
    {
        var goals = await _db.FitnessGoals.AsNoTracking()
            .Where(g => g.UserId == userId)
            .OrderBy(g => g.CompletedAt.HasValue).ThenByDescending(g => g.CreatedDate)
            .ToListAsync(ct);
        return goals.Select(Map).ToList();
    }

    public async Task<FitnessGoalDto> CreateGoalAsync(Guid userId, SaveFitnessGoalRequest request, CancellationToken ct = default)
    {
        var goal = new FitnessGoal { Id = Guid.NewGuid(), UserId = userId };
        Apply(goal, request);
        _db.FitnessGoals.Add(goal);
        await _db.SaveChangesAsync(ct);
        return Map(goal);
    }

    public async Task<FitnessGoalDto?> UpdateGoalAsync(Guid userId, Guid id, SaveFitnessGoalRequest request, CancellationToken ct = default)
    {
        var goal = await _db.FitnessGoals.FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId, ct);
        if (goal == null) return null;
        Apply(goal, request);
        await _db.SaveChangesAsync(ct);
        return Map(goal);
    }

    public async Task<bool> DeleteGoalAsync(Guid userId, Guid id, CancellationToken ct = default) =>
        await _db.FitnessGoals.Where(g => g.Id == id && g.UserId == userId).ExecuteDeleteAsync(ct) > 0;

    public Task<List<OneRepMaxRecordDto>> GetOneRepMaxRecordsAsync(Guid userId, CancellationToken ct = default) =>
        _db.OneRepMaxRecords.AsNoTracking()
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.Date).ThenByDescending(r => r.CreatedDate)
            .Select(r => new OneRepMaxRecordDto { Id = r.Id, ExerciseName = r.ExerciseName, WeightKg = r.WeightKg, Date = r.Date })
            .ToListAsync(ct);

    public async Task<OneRepMaxRecordDto> AddOneRepMaxAsync(Guid userId, SaveOneRepMaxRequest request, CancellationToken ct = default)
    {
        var record = new OneRepMaxRecord
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ExerciseName = request.ExerciseName.Trim(),
            WeightKg = request.WeightKg,
            Date = request.Date,
        };
        _db.OneRepMaxRecords.Add(record);
        await _db.SaveChangesAsync(ct);
        return new OneRepMaxRecordDto { Id = record.Id, ExerciseName = record.ExerciseName, WeightKg = record.WeightKg, Date = record.Date };
    }

    public async Task<bool> DeleteOneRepMaxAsync(Guid userId, Guid id, CancellationToken ct = default) =>
        await _db.OneRepMaxRecords.Where(r => r.Id == id && r.UserId == userId).ExecuteDeleteAsync(ct) > 0;

    private static void Apply(FitnessGoal g, SaveFitnessGoalRequest r)
    {
        g.Title = r.Title.Trim();
        g.Category = r.Category;
        g.TargetValue = r.TargetValue;
        g.CurrentValue = r.CurrentValue;
        g.Unit = r.Unit;
        g.Deadline = r.Deadline;
        if (r.Completed && !g.CompletedAt.HasValue) g.CompletedAt = DateTime.UtcNow;
        if (!r.Completed) g.CompletedAt = null;
    }

    private static FitnessGoalDto Map(FitnessGoal g) => new()
    {
        Id = g.Id,
        Title = g.Title,
        Category = g.Category,
        TargetValue = g.TargetValue,
        CurrentValue = g.CurrentValue,
        Unit = g.Unit,
        Deadline = g.Deadline,
        CreatedAt = DateTime.SpecifyKind(g.CreatedDate, DateTimeKind.Utc),
        CompletedAt = g.CompletedAt.HasValue ? DateTime.SpecifyKind(g.CompletedAt.Value, DateTimeKind.Utc) : null,
    };
}

public class UserSettingsService : IUserSettingsService
{
    private readonly FitLogDbContext _db;

    public UserSettingsService(FitLogDbContext db) => _db = db;

    public async Task<UserSettingsDto> GetAsync(Guid userId, CancellationToken ct = default)
    {
        var s = await _db.UserSettings.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == userId, ct);
        return Map(s ?? new UserSettings { UserId = userId });
    }

    public async Task<UserSettingsDto> SaveAsync(Guid userId, SaveUserSettingsRequest r, CancellationToken ct = default)
    {
        var s = await _db.UserSettings.FirstOrDefaultAsync(x => x.UserId == userId, ct);
        if (s == null)
        {
            s = new UserSettings { Id = Guid.NewGuid(), UserId = userId };
            _db.UserSettings.Add(s);
        }

        s.CalorieTarget = r.CalorieTarget;
        s.ProteinTarget = r.ProteinTarget;
        s.CarbTarget = r.CarbTarget;
        s.FatTarget = r.FatTarget;
        s.WaterGoalGlasses = r.WaterGoalGlasses;
        s.WeightUnit = r.WeightUnit;
        s.MeasurementUnit = r.MeasurementUnit;
        s.DefaultRestSeconds = r.DefaultRestSeconds;
        s.SoundEffects = r.SoundEffects;
        s.Notifications = r.Notifications;
        s.Language = r.Language;
        s.FavoriteFoodIds = string.Join(',', r.FavoriteFoodIds
            .Where(id => !string.IsNullOrWhiteSpace(id) && id.Length <= 64 && !id.Contains(','))
            .Distinct());

        await _db.SaveChangesAsync(ct);
        return Map(s);
    }

    private static UserSettingsDto Map(UserSettings s) => new()
    {
        CalorieTarget = s.CalorieTarget,
        ProteinTarget = s.ProteinTarget,
        CarbTarget = s.CarbTarget,
        FatTarget = s.FatTarget,
        WaterGoalGlasses = s.WaterGoalGlasses,
        WeightUnit = s.WeightUnit,
        MeasurementUnit = s.MeasurementUnit,
        DefaultRestSeconds = s.DefaultRestSeconds,
        SoundEffects = s.SoundEffects,
        Notifications = s.Notifications,
        Language = s.Language,
        FavoriteFoodIds = s.FavoriteFoodIds.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList(),
    };
}

public class CustomFoodService : ICustomFoodService
{
    private readonly FitLogDbContext _db;

    public CustomFoodService(FitLogDbContext db) => _db = db;

    public Task<List<CustomFoodDto>> GetAllAsync(Guid userId, CancellationToken ct = default) =>
        _db.CustomFoods.AsNoTracking()
            .Where(f => f.UserId == userId)
            .OrderBy(f => f.Name)
            .Select(f => Map(f))
            .ToListAsync(ct);

    public async Task<CustomFoodDto> CreateAsync(Guid userId, SaveCustomFoodRequest request, CancellationToken ct = default)
    {
        var food = new CustomFood { Id = Guid.NewGuid(), UserId = userId };
        Apply(food, request);
        _db.CustomFoods.Add(food);
        await _db.SaveChangesAsync(ct);
        return Map(food);
    }

    public async Task<CustomFoodDto?> UpdateAsync(Guid userId, Guid id, SaveCustomFoodRequest request, CancellationToken ct = default)
    {
        var food = await _db.CustomFoods.FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId, ct);
        if (food == null) return null;
        Apply(food, request);
        await _db.SaveChangesAsync(ct);
        return Map(food);
    }

    public async Task<bool> DeleteAsync(Guid userId, Guid id, CancellationToken ct = default) =>
        await _db.CustomFoods.Where(f => f.Id == id && f.UserId == userId).ExecuteDeleteAsync(ct) > 0;

    private static void Apply(CustomFood f, SaveCustomFoodRequest r)
    {
        f.Name = r.Name.Trim();
        f.ServingSize = r.ServingSize;
        f.ServingUnit = r.ServingUnit.Trim();
        f.Calories = r.Calories;
        f.Protein = r.Protein;
        f.Carbohydrates = r.Carbohydrates;
        f.Fat = r.Fat;
    }

    private static CustomFoodDto Map(CustomFood f) => new()
    {
        Id = f.Id,
        Name = f.Name,
        ServingSize = f.ServingSize,
        ServingUnit = f.ServingUnit,
        Calories = f.Calories,
        Protein = f.Protein,
        Carbohydrates = f.Carbohydrates,
        Fat = f.Fat,
    };
}

public class SupplementIntakeService : ISupplementIntakeService
{
    private readonly FitLogDbContext _db;

    public SupplementIntakeService(FitLogDbContext db) => _db = db;

    public Task<List<SupplementIntakeDto>> GetForDateAsync(Guid userId, DateOnly date, CancellationToken ct = default) =>
        _db.SupplementIntakes.AsNoTracking()
            .Where(i => i.UserId == userId && i.Date == date)
            .Select(i => new SupplementIntakeDto { SupplementId = i.SupplementId, Date = i.Date, TakenAt = i.TakenAt })
            .ToListAsync(ct);

    public async Task<SupplementIntakeDto?> MarkTakenAsync(Guid userId, Guid supplementId, DateOnly date, CancellationToken ct = default)
    {
        if (!await _db.Supplements.AnyAsync(s => s.Id == supplementId && s.UserId == userId, ct))
            return null;

        var intake = await _db.SupplementIntakes
            .FirstOrDefaultAsync(i => i.UserId == userId && i.SupplementId == supplementId && i.Date == date, ct);
        if (intake == null)
        {
            intake = new SupplementIntake
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                SupplementId = supplementId,
                Date = date,
                TakenAt = DateTime.UtcNow,
            };
            _db.SupplementIntakes.Add(intake);
            await _db.SaveChangesAsync(ct);
        }
        return new SupplementIntakeDto { SupplementId = intake.SupplementId, Date = intake.Date, TakenAt = intake.TakenAt };
    }

    public async Task<bool> UnmarkAsync(Guid userId, Guid supplementId, DateOnly date, CancellationToken ct = default) =>
        await _db.SupplementIntakes
            .Where(i => i.UserId == userId && i.SupplementId == supplementId && i.Date == date)
            .ExecuteDeleteAsync(ct) > 0;
}

public class MealTemplateService : IMealTemplateService
{
    private const int MaxTemplatesPerUser = 50;
    private readonly FitLogDbContext _db;

    public MealTemplateService(FitLogDbContext db) => _db = db;

    public Task<List<MealTemplateDto>> GetAllAsync(Guid userId, CancellationToken ct = default) =>
        _db.MealTemplates.AsNoTracking()
            .Where(t => t.UserId == userId)
            .OrderBy(t => t.Name)
            .Select(t => new MealTemplateDto { Id = t.Id, Name = t.Name, ItemsJson = t.ItemsJson, CreatedDate = t.CreatedDate })
            .ToListAsync(ct);

    public async Task<MealTemplateDto?> CreateAsync(Guid userId, SaveMealTemplateRequest request, CancellationToken ct = default)
    {
        // Must be a JSON array; reject anything else rather than storing junk
        try
        {
            using var doc = System.Text.Json.JsonDocument.Parse(request.ItemsJson);
            if (doc.RootElement.ValueKind != System.Text.Json.JsonValueKind.Array || doc.RootElement.GetArrayLength() == 0)
                return null;
        }
        catch (System.Text.Json.JsonException)
        {
            return null;
        }

        if (await _db.MealTemplates.CountAsync(t => t.UserId == userId, ct) >= MaxTemplatesPerUser)
            return null;

        var template = new MealTemplate { Id = Guid.NewGuid(), UserId = userId, Name = request.Name.Trim(), ItemsJson = request.ItemsJson };
        _db.MealTemplates.Add(template);
        await _db.SaveChangesAsync(ct);
        return new MealTemplateDto { Id = template.Id, Name = template.Name, ItemsJson = template.ItemsJson, CreatedDate = template.CreatedDate };
    }

    public async Task<bool> DeleteAsync(Guid userId, Guid id, CancellationToken ct = default) =>
        await _db.MealTemplates.Where(t => t.Id == id && t.UserId == userId).ExecuteDeleteAsync(ct) > 0;
}
