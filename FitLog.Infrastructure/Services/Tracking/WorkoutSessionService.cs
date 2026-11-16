using FitLog.Application.DTOs.Tracking;
using FitLog.Application.Services;
using FitLog.Domain.Entities;
using FitLog.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FitLog.Infrastructure.Services.Tracking;

public class WorkoutSessionService : IWorkoutSessionService
{
    private readonly FitLogDbContext _db;

    public WorkoutSessionService(FitLogDbContext db) => _db = db;

    public async Task<List<WorkoutSessionDto>> GetSessionsAsync(Guid userId, DateTime? from, DateTime? to, bool includeSets, CancellationToken ct = default)
    {
        var query = _db.WorkoutSessions.AsNoTracking().Include(s => s.Sets).Where(s => s.UserId == userId);
        if (from.HasValue) query = query.Where(s => s.StartedAt >= from.Value.ToUniversalTime());
        if (to.HasValue) query = query.Where(s => s.StartedAt < to.Value.ToUniversalTime());

        var sessions = await query.OrderByDescending(s => s.StartedAt).ToListAsync(ct);
        return sessions.Select(s => Map(s, includeSets)).ToList();
    }

    public async Task<WorkoutSessionDto?> GetSessionAsync(Guid userId, Guid id, CancellationToken ct = default)
    {
        var session = await _db.WorkoutSessions.AsNoTracking().Include(s => s.Sets)
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId, ct);
        return session == null ? null : Map(session, includeSets: true);
    }

    public async Task<WorkoutSessionDto> CreateSessionAsync(Guid userId, SaveWorkoutSessionRequest request, CancellationToken ct = default)
    {
        await EnsureProgramOwnershipAsync(userId, request, ct);
        var session = new WorkoutSession { Id = Guid.NewGuid(), UserId = userId };
        Apply(session, request);
        _db.WorkoutSessions.Add(session);
        await _db.SaveChangesAsync(ct);
        return Map(session, includeSets: true);
    }

    public async Task<WorkoutSessionDto?> UpdateSessionAsync(Guid userId, Guid id, SaveWorkoutSessionRequest request, CancellationToken ct = default)
    {
        var session = await _db.WorkoutSessions.Include(s => s.Sets)
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId, ct);
        if (session == null) return null;

        await EnsureProgramOwnershipAsync(userId, request, ct);
        _db.SessionSets.RemoveRange(session.Sets);
        session.Sets.Clear();
        Apply(session, request);
        await _db.SaveChangesAsync(ct);
        return Map(session, includeSets: true);
    }

    public async Task<bool> DeleteSessionAsync(Guid userId, Guid id, CancellationToken ct = default)
    {
        var deleted = await _db.WorkoutSessions.Where(s => s.Id == id && s.UserId == userId).ExecuteDeleteAsync(ct);
        return deleted > 0;
    }

    public Task<List<string>> GetLoggedExerciseNamesAsync(Guid userId, CancellationToken ct = default) =>
        _db.SessionSets.AsNoTracking()
            .Where(s => s.WorkoutSession.UserId == userId && !s.IsWarmup && s.WeightKg > 0)
            .Select(s => s.ExerciseName)
            .Distinct()
            .OrderBy(n => n)
            .ToListAsync(ct);

    public async Task<List<ExerciseHistoryPoint>> GetExerciseHistoryAsync(Guid userId, string exerciseName, CancellationToken ct = default)
    {
        var sets = await _db.SessionSets.AsNoTracking()
            .Where(s => s.WorkoutSession.UserId == userId && s.ExerciseName == exerciseName && !s.IsWarmup && s.Reps > 0)
            .Select(s => new { s.WorkoutSessionId, s.WorkoutSession.StartedAt, s.WeightKg, s.Reps })
            .ToListAsync(ct);

        return sets
            .GroupBy(s => new { s.WorkoutSessionId, s.StartedAt })
            .Select(g =>
            {
                var best = g.OrderByDescending(s => s.WeightKg).ThenByDescending(s => s.Reps).First();
                return new ExerciseHistoryPoint
                {
                    Date = DateTime.SpecifyKind(g.Key.StartedAt, DateTimeKind.Utc),
                    BestWeightKg = best.WeightKg,
                    RepsAtBest = best.Reps,
                    Estimated1Rm = g.Max(s => Epley(s.WeightKg, s.Reps)),
                    VolumeKg = g.Sum(s => s.WeightKg * s.Reps),
                };
            })
            .OrderBy(p => p.Date)
            .ToList();
    }

    public async Task<List<WeeklyVolumePoint>> GetWeeklyVolumeAsync(Guid userId, int weeks, CancellationToken ct = default)
    {
        weeks = Math.Clamp(weeks, 1, 104);
        var firstWeek = StartOfWeek(DateOnly.FromDateTime(DateTime.UtcNow)).AddDays(-7 * (weeks - 1));
        var from = firstWeek.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);

        var sessions = await _db.WorkoutSessions.AsNoTracking().Include(s => s.Sets)
            .Where(s => s.UserId == userId && s.StartedAt >= from)
            .ToListAsync(ct);

        var byWeek = sessions.GroupBy(s => StartOfWeek(DateOnly.FromDateTime(s.StartedAt))).ToDictionary(g => g.Key);
        var result = new List<WeeklyVolumePoint>();
        for (var i = 0; i < weeks; i++)
        {
            var week = firstWeek.AddDays(7 * i);
            byWeek.TryGetValue(week, out var group);
            var list = group?.ToList() ?? new List<WorkoutSession>();
            var working = list.SelectMany(s => s.Sets).Where(s => !s.IsWarmup).ToList();
            result.Add(new WeeklyVolumePoint
            {
                WeekStart = week,
                Sessions = list.Count,
                Sets = working.Count,
                VolumeKg = working.Sum(s => s.WeightKg * s.Reps),
                CardioMinutes = list.Where(s => s.Type == SessionType.Cardio).Sum(s => s.DurationSeconds) / 60,
            });
        }
        return result;
    }

    public async Task<List<PersonalRecordDto>> GetPersonalRecordsAsync(Guid userId, CancellationToken ct = default)
    {
        var sets = await _db.SessionSets.AsNoTracking()
            .Where(s => s.WorkoutSession.UserId == userId && !s.IsWarmup && s.Reps > 0 && s.WeightKg > 0)
            .Select(s => new { s.ExerciseName, s.WeightKg, s.Reps, s.WorkoutSession.StartedAt })
            .ToListAsync(ct);

        return sets.GroupBy(s => s.ExerciseName)
            .Select(g =>
            {
                var best = g.OrderByDescending(s => s.WeightKg).ThenByDescending(s => s.Reps).ThenBy(s => s.StartedAt).First();
                return new PersonalRecordDto
                {
                    ExerciseName = g.Key,
                    BestWeightKg = best.WeightKg,
                    RepsAtBest = best.Reps,
                    BestEstimated1Rm = g.Max(s => Epley(s.WeightKg, s.Reps)),
                    AchievedAt = DateTime.SpecifyKind(best.StartedAt, DateTimeKind.Utc),
                };
            })
            .OrderByDescending(r => r.BestEstimated1Rm)
            .ToList();
    }

    // ------------------------------------------------------------------

    private async Task EnsureProgramOwnershipAsync(Guid userId, SaveWorkoutSessionRequest request, CancellationToken ct)
    {
        if (request.WorkoutProgramId is { } programId &&
            !await _db.WorkoutPrograms.AnyAsync(p => p.Id == programId && p.UserId == userId, ct))
        {
            // Don't link sessions to programs the user doesn't own.
            request.WorkoutProgramId = null;
            request.WorkoutDayId = null;
        }
    }

    private static void Apply(WorkoutSession session, SaveWorkoutSessionRequest r)
    {
        session.WorkoutProgramId = r.WorkoutProgramId;
        session.WorkoutDayId = r.WorkoutDayId;
        session.Name = r.Name.Trim();
        session.Type = r.Type == "cardio" ? SessionType.Cardio : SessionType.Strength;
        session.StartedAt = r.StartedAt.ToUniversalTime();
        session.EndedAt = r.EndedAt?.ToUniversalTime();
        session.DurationSeconds = r.DurationSeconds;
        session.Notes = r.Notes;
        session.CardioActivity = r.CardioActivity;
        session.DistanceKm = r.DistanceKm;
        session.AverageHeartRate = r.AverageHeartRate;
        session.CaloriesBurned = r.CaloriesBurned;

        foreach (var s in r.Sets)
        {
            session.Sets.Add(new SessionSet
            {
                Id = Guid.NewGuid(),
                ExerciseName = s.ExerciseName.Trim(),
                ExerciseOrder = s.ExerciseOrder,
                SetNumber = s.SetNumber,
                Reps = s.Reps,
                WeightKg = s.WeightKg,
                Rpe = s.Rpe,
                IsWarmup = s.IsWarmup,
            });
        }
    }

    private static WorkoutSessionDto Map(WorkoutSession s, bool includeSets)
    {
        var working = s.Sets.Where(x => !x.IsWarmup).ToList();
        return new WorkoutSessionDto
        {
            Id = s.Id,
            WorkoutProgramId = s.WorkoutProgramId,
            WorkoutDayId = s.WorkoutDayId,
            Name = s.Name,
            Type = s.Type == SessionType.Cardio ? "cardio" : "strength",
            StartedAt = DateTime.SpecifyKind(s.StartedAt, DateTimeKind.Utc),
            EndedAt = s.EndedAt.HasValue ? DateTime.SpecifyKind(s.EndedAt.Value, DateTimeKind.Utc) : null,
            DurationSeconds = s.DurationSeconds,
            Notes = s.Notes,
            CardioActivity = s.CardioActivity,
            DistanceKm = s.DistanceKm,
            AverageHeartRate = s.AverageHeartRate,
            CaloriesBurned = s.CaloriesBurned,
            SetCount = working.Count,
            TotalVolumeKg = working.Sum(x => x.WeightKg * x.Reps),
            Sets = includeSets
                ? s.Sets.OrderBy(x => x.ExerciseOrder).ThenBy(x => x.SetNumber).Select(x => new SessionSetDto
                {
                    Id = x.Id,
                    ExerciseName = x.ExerciseName,
                    ExerciseOrder = x.ExerciseOrder,
                    SetNumber = x.SetNumber,
                    Reps = x.Reps,
                    WeightKg = x.WeightKg,
                    Rpe = x.Rpe,
                    IsWarmup = x.IsWarmup,
                }).ToList()
                : new List<SessionSetDto>(),
        };
    }

    /// <summary>Epley one-rep-max estimate. A single rep is the 1RM itself.</summary>
    internal static decimal Epley(decimal weight, int reps) =>
        reps <= 1 ? weight : Math.Round(weight * (1 + reps / 30m), 1);

    private static DateOnly StartOfWeek(DateOnly d)
    {
        var diff = ((int)d.DayOfWeek + 6) % 7; // Monday = 0
        return d.AddDays(-diff);
    }
}
