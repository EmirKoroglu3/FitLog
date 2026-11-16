using FitLog.Domain.Common;

namespace FitLog.Domain.Entities;

public class FitnessGoal : BaseEntity
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    /// <summary>weight | strength | body | habit | nutrition</summary>
    public string Category { get; set; } = "strength";
    public decimal TargetValue { get; set; }
    public decimal CurrentValue { get; set; }
    public string Unit { get; set; } = string.Empty;
    public DateOnly? Deadline { get; set; }
    public DateTime? CompletedAt { get; set; }
}

/// <summary>A one-rep-max estimate or test result for an exercise.</summary>
public class OneRepMaxRecord : BaseEntity
{
    public Guid UserId { get; set; }
    public string ExerciseName { get; set; } = string.Empty;
    public decimal WeightKg { get; set; }
    public DateOnly Date { get; set; }
}
