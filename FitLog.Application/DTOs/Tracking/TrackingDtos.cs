using System.ComponentModel.DataAnnotations;

namespace FitLog.Application.DTOs.Tracking;

// ---------------------------------------------------------------------------
// Workout sessions
// ---------------------------------------------------------------------------

public class SessionSetDto
{
    public Guid Id { get; set; }
    public string ExerciseName { get; set; } = string.Empty;
    public int ExerciseOrder { get; set; }
    public int SetNumber { get; set; }
    public int Reps { get; set; }
    public decimal WeightKg { get; set; }
    public decimal? Rpe { get; set; }
    public bool IsWarmup { get; set; }
}

public class WorkoutSessionDto
{
    public Guid Id { get; set; }
    public Guid? WorkoutProgramId { get; set; }
    public Guid? WorkoutDayId { get; set; }
    public string Name { get; set; } = string.Empty;
    /// <summary>strength | cardio</summary>
    public string Type { get; set; } = "strength";
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public int DurationSeconds { get; set; }
    public string? Notes { get; set; }
    public string? CardioActivity { get; set; }
    public decimal? DistanceKm { get; set; }
    public int? AverageHeartRate { get; set; }
    public int? CaloriesBurned { get; set; }
    public int SetCount { get; set; }
    public decimal TotalVolumeKg { get; set; }
    public List<SessionSetDto> Sets { get; set; } = new();
}

public class SessionSetInput
{
    [Required, MaxLength(100)]
    public string ExerciseName { get; set; } = string.Empty;
    [Range(0, 100)]
    public int ExerciseOrder { get; set; }
    [Range(1, 100)]
    public int SetNumber { get; set; }
    [Range(0, 1000)]
    public int Reps { get; set; }
    [Range(0, 2000)]
    public decimal WeightKg { get; set; }
    [Range(1, 10)]
    public decimal? Rpe { get; set; }
    public bool IsWarmup { get; set; }
}

public class SaveWorkoutSessionRequest
{
    public Guid? WorkoutProgramId { get; set; }
    public Guid? WorkoutDayId { get; set; }
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    /// <summary>strength | cardio</summary>
    [RegularExpression("^(strength|cardio)$")]
    public string Type { get; set; } = "strength";
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    [Range(0, 24 * 3600)]
    public int DurationSeconds { get; set; }
    [MaxLength(1000)]
    public string? Notes { get; set; }
    [MaxLength(50)]
    public string? CardioActivity { get; set; }
    [Range(0, 1000)]
    public decimal? DistanceKm { get; set; }
    [Range(30, 250)]
    public int? AverageHeartRate { get; set; }
    [Range(0, 10000)]
    public int? CaloriesBurned { get; set; }
    [MaxLength(300)]
    public List<SessionSetInput> Sets { get; set; } = new();
}

public class ExerciseHistoryPoint
{
    public DateTime Date { get; set; }
    public decimal BestWeightKg { get; set; }
    public int RepsAtBest { get; set; }
    /// <summary>Best Epley estimate in the session: w × (1 + reps/30).</summary>
    public decimal Estimated1Rm { get; set; }
    public decimal VolumeKg { get; set; }
}

public class WeeklyVolumePoint
{
    public DateOnly WeekStart { get; set; }
    public int Sessions { get; set; }
    public int Sets { get; set; }
    public decimal VolumeKg { get; set; }
    public int CardioMinutes { get; set; }
}

public class PersonalRecordDto
{
    public string ExerciseName { get; set; } = string.Empty;
    public decimal BestWeightKg { get; set; }
    public int RepsAtBest { get; set; }
    public decimal BestEstimated1Rm { get; set; }
    public DateTime AchievedAt { get; set; }
}

// ---------------------------------------------------------------------------
// Body tracking
// ---------------------------------------------------------------------------

public class BodyMeasurementDto
{
    public Guid Id { get; set; }
    public DateOnly Date { get; set; }
    public decimal? WeightKg { get; set; }
    public decimal? BodyFatPercent { get; set; }
    public decimal? Chest { get; set; }
    public decimal? Waist { get; set; }
    public decimal? Hips { get; set; }
    public decimal? Biceps { get; set; }
    public decimal? Thigh { get; set; }
    public decimal? Calf { get; set; }
    public decimal? Neck { get; set; }
}

public class SaveBodyMeasurementRequest
{
    public DateOnly Date { get; set; }
    [Range(20, 400)] public decimal? WeightKg { get; set; }
    [Range(2, 70)] public decimal? BodyFatPercent { get; set; }
    [Range(30, 250)] public decimal? Chest { get; set; }
    [Range(30, 250)] public decimal? Waist { get; set; }
    [Range(30, 250)] public decimal? Hips { get; set; }
    [Range(10, 80)] public decimal? Biceps { get; set; }
    [Range(20, 120)] public decimal? Thigh { get; set; }
    [Range(15, 80)] public decimal? Calf { get; set; }
    [Range(20, 70)] public decimal? Neck { get; set; }
}

public class WaterLogDto
{
    public DateOnly Date { get; set; }
    public int Glasses { get; set; }
}

public class SetWaterRequest
{
    [Range(0, 40)]
    public int Glasses { get; set; }
}

public class ProgressPhotoDto
{
    public Guid Id { get; set; }
    public DateOnly Date { get; set; }
    public string Pose { get; set; } = "front";
    public string? Note { get; set; }
}

public class UploadProgressPhotoRequest
{
    public DateOnly Date { get; set; }
    [RegularExpression("^(front|side|back)$")]
    public string Pose { get; set; } = "front";
    [MaxLength(300)]
    public string? Note { get; set; }
    /// <summary>data:image/jpeg;base64,... — the client resizes to ≤ 1080px before upload.</summary>
    [Required, MaxLength(2_000_000)]
    public string DataUrl { get; set; } = string.Empty;
}

// ---------------------------------------------------------------------------
// Goals & one-rep max
// ---------------------------------------------------------------------------

public class FitnessGoalDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = "strength";
    public decimal TargetValue { get; set; }
    public decimal CurrentValue { get; set; }
    public string Unit { get; set; } = string.Empty;
    public DateOnly? Deadline { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public bool Completed => CompletedAt.HasValue;
}

public class SaveFitnessGoalRequest
{
    [Required, MaxLength(150)]
    public string Title { get; set; } = string.Empty;
    [RegularExpression("^(weight|strength|body|habit|nutrition)$")]
    public string Category { get; set; } = "strength";
    [Range(0, 100000)] public decimal TargetValue { get; set; }
    [Range(0, 100000)] public decimal CurrentValue { get; set; }
    [MaxLength(20)] public string Unit { get; set; } = string.Empty;
    public DateOnly? Deadline { get; set; }
    public bool Completed { get; set; }
}

public class OneRepMaxRecordDto
{
    public Guid Id { get; set; }
    public string ExerciseName { get; set; } = string.Empty;
    public decimal WeightKg { get; set; }
    public DateOnly Date { get; set; }
}

public class SaveOneRepMaxRequest
{
    [Required, MaxLength(100)]
    public string ExerciseName { get; set; } = string.Empty;
    [Range(1, 2000)]
    public decimal WeightKg { get; set; }
    public DateOnly Date { get; set; }
}

// ---------------------------------------------------------------------------
// Settings, custom foods, supplement intake
// ---------------------------------------------------------------------------

public class UserSettingsDto
{
    public int? CalorieTarget { get; set; }
    public int? ProteinTarget { get; set; }
    public int? CarbTarget { get; set; }
    public int? FatTarget { get; set; }
    public int WaterGoalGlasses { get; set; } = 8;
    public string WeightUnit { get; set; } = "kg";
    public string MeasurementUnit { get; set; } = "cm";
    public int DefaultRestSeconds { get; set; } = 90;
    public bool SoundEffects { get; set; } = true;
    public bool Notifications { get; set; }
    public string Language { get; set; } = "tr";
    public List<string> FavoriteFoodIds { get; set; } = new();
}

public class SaveUserSettingsRequest
{
    [Range(800, 10000)] public int? CalorieTarget { get; set; }
    [Range(0, 600)] public int? ProteinTarget { get; set; }
    [Range(0, 1500)] public int? CarbTarget { get; set; }
    [Range(0, 500)] public int? FatTarget { get; set; }
    [Range(1, 40)] public int WaterGoalGlasses { get; set; } = 8;
    [RegularExpression("^(kg|lbs)$")] public string WeightUnit { get; set; } = "kg";
    [RegularExpression("^(cm|inch)$")] public string MeasurementUnit { get; set; } = "cm";
    [Range(15, 600)] public int DefaultRestSeconds { get; set; } = 90;
    public bool SoundEffects { get; set; } = true;
    public bool Notifications { get; set; }
    [RegularExpression("^(tr|en)$")] public string Language { get; set; } = "tr";
    [MaxLength(200)] public List<string> FavoriteFoodIds { get; set; } = new();
}

public class CustomFoodDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal ServingSize { get; set; }
    public string ServingUnit { get; set; } = "g";
    public decimal Calories { get; set; }
    public decimal Protein { get; set; }
    public decimal Carbohydrates { get; set; }
    public decimal Fat { get; set; }
}

public class SaveCustomFoodRequest
{
    [Required, MaxLength(100)] public string Name { get; set; } = string.Empty;
    [Range(0.1, 5000)] public decimal ServingSize { get; set; } = 100;
    [Required, MaxLength(30)] public string ServingUnit { get; set; } = "g";
    [Range(0, 5000)] public decimal Calories { get; set; }
    [Range(0, 500)] public decimal Protein { get; set; }
    [Range(0, 1000)] public decimal Carbohydrates { get; set; }
    [Range(0, 500)] public decimal Fat { get; set; }
}

public class SupplementIntakeDto
{
    public Guid SupplementId { get; set; }
    public DateOnly Date { get; set; }
    public DateTime TakenAt { get; set; }
}
