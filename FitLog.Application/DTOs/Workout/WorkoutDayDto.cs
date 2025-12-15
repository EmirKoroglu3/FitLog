namespace FitLog.Application.DTOs.Workout;

/// <summary>
/// Antrenman günü DTO'ları.
/// </summary>
public class WorkoutDayDto
{
    public Guid Id { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public string? Name { get; set; }
    public List<ExerciseDto> Exercises { get; set; } = new();
}

public class CreateWorkoutDayRequest
{
    public Guid WorkoutProgramId { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public string? Name { get; set; }
}

public class UpdateWorkoutDayRequest
{
    public DayOfWeek DayOfWeek { get; set; }
    public string? Name { get; set; }
}

