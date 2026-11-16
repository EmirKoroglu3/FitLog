using FitLog.Application.DTOs.Tracking;

namespace FitLog.Application.Services;

// Every method takes the caller's userId and only touches that user's rows.
// "Not found" is returned for rows that belong to someone else, so ids can't be probed.

public interface IWorkoutSessionService
{
    Task<List<WorkoutSessionDto>> GetSessionsAsync(Guid userId, DateTime? from, DateTime? to, bool includeSets, CancellationToken ct = default);
    Task<WorkoutSessionDto?> GetSessionAsync(Guid userId, Guid id, CancellationToken ct = default);
    Task<WorkoutSessionDto> CreateSessionAsync(Guid userId, SaveWorkoutSessionRequest request, CancellationToken ct = default);
    Task<WorkoutSessionDto?> UpdateSessionAsync(Guid userId, Guid id, SaveWorkoutSessionRequest request, CancellationToken ct = default);
    Task<bool> DeleteSessionAsync(Guid userId, Guid id, CancellationToken ct = default);

    Task<List<string>> GetLoggedExerciseNamesAsync(Guid userId, CancellationToken ct = default);
    Task<List<ExerciseHistoryPoint>> GetExerciseHistoryAsync(Guid userId, string exerciseName, CancellationToken ct = default);
    Task<List<WeeklyVolumePoint>> GetWeeklyVolumeAsync(Guid userId, int weeks, CancellationToken ct = default);
    Task<List<PersonalRecordDto>> GetPersonalRecordsAsync(Guid userId, CancellationToken ct = default);
}

public interface IBodyTrackingService
{
    Task<List<BodyMeasurementDto>> GetMeasurementsAsync(Guid userId, CancellationToken ct = default);
    Task<BodyMeasurementDto> CreateMeasurementAsync(Guid userId, SaveBodyMeasurementRequest request, CancellationToken ct = default);
    Task<BodyMeasurementDto?> UpdateMeasurementAsync(Guid userId, Guid id, SaveBodyMeasurementRequest request, CancellationToken ct = default);
    Task<bool> DeleteMeasurementAsync(Guid userId, Guid id, CancellationToken ct = default);

    Task<List<WaterLogDto>> GetWaterLogsAsync(Guid userId, DateOnly from, DateOnly to, CancellationToken ct = default);
    Task<WaterLogDto> SetWaterAsync(Guid userId, DateOnly date, int glasses, CancellationToken ct = default);

    Task<List<ProgressPhotoDto>> GetPhotosAsync(Guid userId, CancellationToken ct = default);
    Task<(byte[] Data, string ContentType)?> GetPhotoImageAsync(Guid userId, Guid id, CancellationToken ct = default);
    Task<ProgressPhotoDto> UploadPhotoAsync(Guid userId, UploadProgressPhotoRequest request, CancellationToken ct = default);
    Task<bool> DeletePhotoAsync(Guid userId, Guid id, CancellationToken ct = default);
}

public interface IGoalService
{
    Task<List<FitnessGoalDto>> GetGoalsAsync(Guid userId, CancellationToken ct = default);
    Task<FitnessGoalDto> CreateGoalAsync(Guid userId, SaveFitnessGoalRequest request, CancellationToken ct = default);
    Task<FitnessGoalDto?> UpdateGoalAsync(Guid userId, Guid id, SaveFitnessGoalRequest request, CancellationToken ct = default);
    Task<bool> DeleteGoalAsync(Guid userId, Guid id, CancellationToken ct = default);

    Task<List<OneRepMaxRecordDto>> GetOneRepMaxRecordsAsync(Guid userId, CancellationToken ct = default);
    Task<OneRepMaxRecordDto> AddOneRepMaxAsync(Guid userId, SaveOneRepMaxRequest request, CancellationToken ct = default);
    Task<bool> DeleteOneRepMaxAsync(Guid userId, Guid id, CancellationToken ct = default);
}

public interface IUserSettingsService
{
    Task<UserSettingsDto> GetAsync(Guid userId, CancellationToken ct = default);
    Task<UserSettingsDto> SaveAsync(Guid userId, SaveUserSettingsRequest request, CancellationToken ct = default);
}

public interface ICustomFoodService
{
    Task<List<CustomFoodDto>> GetAllAsync(Guid userId, CancellationToken ct = default);
    Task<CustomFoodDto> CreateAsync(Guid userId, SaveCustomFoodRequest request, CancellationToken ct = default);
    Task<CustomFoodDto?> UpdateAsync(Guid userId, Guid id, SaveCustomFoodRequest request, CancellationToken ct = default);
    Task<bool> DeleteAsync(Guid userId, Guid id, CancellationToken ct = default);
}

public interface ISupplementIntakeService
{
    Task<List<SupplementIntakeDto>> GetForDateAsync(Guid userId, DateOnly date, CancellationToken ct = default);
    /// <returns>null when the supplement doesn't exist or isn't the user's.</returns>
    Task<SupplementIntakeDto?> MarkTakenAsync(Guid userId, Guid supplementId, DateOnly date, CancellationToken ct = default);
    Task<bool> UnmarkAsync(Guid userId, Guid supplementId, DateOnly date, CancellationToken ct = default);
}
