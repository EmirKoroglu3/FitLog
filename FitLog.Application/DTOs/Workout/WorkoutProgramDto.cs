namespace FitLog.Application.DTOs.Workout;

/// <summary>
/// Antrenman programı DTO'ları.
/// </summary>
public class WorkoutProgramDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedDate { get; set; }
    public List<WorkoutDayDto> WorkoutDays { get; set; } = new();
}

public class CreateWorkoutProgramRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class UpdateWorkoutProgramRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

