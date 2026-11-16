using FitLog.Application.Interfaces;
using FitLog.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FitLog.Infrastructure.Services;

public class ResourceOwnershipService : IResourceOwnershipService
{
    private readonly FitLogDbContext _db;

    public ResourceOwnershipService(FitLogDbContext db) => _db = db;

    public Task<bool> OwnsProgramAsync(Guid userId, Guid programId, CancellationToken ct = default) =>
        _db.WorkoutPrograms.AnyAsync(p => p.Id == programId && p.UserId == userId, ct);

    public Task<bool> OwnsDayAsync(Guid userId, Guid dayId, CancellationToken ct = default) =>
        _db.WorkoutDays.AnyAsync(d => d.Id == dayId && d.WorkoutProgram.UserId == userId, ct);

    public Task<bool> OwnsExerciseAsync(Guid userId, Guid exerciseId, CancellationToken ct = default) =>
        _db.Exercises.AnyAsync(e => e.Id == exerciseId && e.WorkoutDay.WorkoutProgram.UserId == userId, ct);

    public Task<bool> OwnsNutritionLogAsync(Guid userId, Guid logId, CancellationToken ct = default) =>
        _db.NutritionLogs.AnyAsync(n => n.Id == logId && n.UserId == userId, ct);

    public Task<bool> OwnsSupplementAsync(Guid userId, Guid supplementId, CancellationToken ct = default) =>
        _db.Supplements.AnyAsync(s => s.Id == supplementId && s.UserId == userId, ct);
}
