using FitLog.Domain.Common;

namespace FitLog.Domain.Entities;

/// <summary>
/// A completed (or in-progress) training session: what the user actually did,
/// as opposed to <see cref="WorkoutProgram"/> which is the plan.
/// </summary>
public class WorkoutSession : BaseEntity
{
    public Guid UserId { get; set; }

    /// <summary>Program/day the session was started from (null for ad-hoc or cardio sessions).</summary>
    public Guid? WorkoutProgramId { get; set; }
    public Guid? WorkoutDayId { get; set; }

    public string Name { get; set; } = string.Empty;
    public SessionType Type { get; set; } = SessionType.Strength;

    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public int DurationSeconds { get; set; }
    public string? Notes { get; set; }

    // Cardio details (used when Type == Cardio)
    public string? CardioActivity { get; set; }
    public decimal? DistanceKm { get; set; }
    /// <summary>Treadmill speed in km/h (optional).</summary>
    public decimal? SpeedKmh { get; set; }
    /// <summary>Treadmill incline in percent (optional).</summary>
    public decimal? InclinePercent { get; set; }
    public int? AverageHeartRate { get; set; }
    public int? CaloriesBurned { get; set; }

    public virtual ICollection<SessionSet> Sets { get; set; } = new List<SessionSet>();
}

public enum SessionType
{
    Strength = 0,
    Cardio = 1,
}

/// <summary>One performed set within a session.</summary>
public class SessionSet : BaseEntity
{
    public Guid WorkoutSessionId { get; set; }
    public virtual WorkoutSession WorkoutSession { get; set; } = null!;

    public string ExerciseName { get; set; } = string.Empty;
    /// <summary>Order of the exercise within the session (0-based).</summary>
    public int ExerciseOrder { get; set; }
    public int SetNumber { get; set; }

    public int Reps { get; set; }
    public decimal WeightKg { get; set; }
    /// <summary>Rate of perceived exertion, 1–10 (optional).</summary>
    public decimal? Rpe { get; set; }
    public bool IsWarmup { get; set; }
}
