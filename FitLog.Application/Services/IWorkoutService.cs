using FitLog.Application.DTOs.Workout;

namespace FitLog.Application.Services;

/// <summary>
/// Workout servisi interface'i.
/// </summary>
public interface IWorkoutService
{
    // Workout Programs
    Task<List<WorkoutProgramDto>> GetUserWorkoutProgramsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<WorkoutProgramDto?> GetWorkoutProgramByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<WorkoutProgramDto> CreateWorkoutProgramAsync(Guid userId, CreateWorkoutProgramRequest request, CancellationToken cancellationToken = default);
    Task<WorkoutProgramDto?> UpdateWorkoutProgramAsync(Guid id, UpdateWorkoutProgramRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteWorkoutProgramAsync(Guid id, CancellationToken cancellationToken = default);

    // Workout Days
    Task<WorkoutDayDto> CreateWorkoutDayAsync(CreateWorkoutDayRequest request, CancellationToken cancellationToken = default);
    Task<WorkoutDayDto?> UpdateWorkoutDayAsync(Guid id, UpdateWorkoutDayRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteWorkoutDayAsync(Guid id, CancellationToken cancellationToken = default);

    // Exercises
    Task<ExerciseDto> CreateExerciseAsync(CreateExerciseRequest request, CancellationToken cancellationToken = default);
    Task<ExerciseDto?> UpdateExerciseAsync(Guid id, UpdateExerciseRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteExerciseAsync(Guid id, CancellationToken cancellationToken = default);
}

