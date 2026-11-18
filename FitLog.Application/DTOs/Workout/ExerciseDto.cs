namespace FitLog.Application.DTOs.Workout;

/// <summary>
/// Egzersiz DTO'ları.
/// </summary>
public class ExerciseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int SetCount { get; set; }
    public int Reps { get; set; }
    public decimal? Weight { get; set; }
    public string? Notes { get; set; }
    public int Order { get; set; }
    public bool SupersetWithNext { get; set; }
}

/// <summary>New order of a day's exercises: every exercise id of the day, first to last.</summary>
public class ReorderExercisesRequest
{
    public List<Guid> ExerciseIds { get; set; } = new();
}

public class CreateExerciseRequest
{
    public Guid WorkoutDayId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int SetCount { get; set; }
    public int Reps { get; set; }
    public decimal? Weight { get; set; }
    public string? Notes { get; set; }
}

public class UpdateExerciseRequest
{
    public string Name { get; set; } = string.Empty;
    public int SetCount { get; set; }
    public int Reps { get; set; }
    public decimal? Weight { get; set; }
    /// <summary>null = keep the current note, "" = clear it.</summary>
    public string? Notes { get; set; }
    /// <summary>null = keep the current value.</summary>
    public bool? SupersetWithNext { get; set; }
}

