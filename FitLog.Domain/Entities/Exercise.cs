using FitLog.Domain.Common;

namespace FitLog.Domain.Entities;

/// <summary>
/// Egzersiz entity'si.
/// Her antrenman gününde birden fazla egzersiz olabilir.
/// </summary>
public class Exercise : BaseEntity
{
    public Guid WorkoutDayId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int SetCount { get; set; }
    public int Reps { get; set; }
    public decimal? Weight { get; set; } // Kilo (kg)
    public string? Notes { get; set; }
    
    // Navigation Property
    public virtual WorkoutDay WorkoutDay { get; set; } = null!;
}

