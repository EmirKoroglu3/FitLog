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
    public string? Notes { get; set; }
}

