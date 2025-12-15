using FitLog.Domain.Common;

namespace FitLog.Domain.Entities;

/// <summary>
/// Antrenman günü entity'si.
/// Her programın birden fazla günü olabilir.
/// </summary>
public class WorkoutDay : BaseEntity
{
    public Guid WorkoutProgramId { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public string? Name { get; set; } // Örn: "Göğüs Günü", "Bacak Günü"
    
    // Navigation Properties
    public virtual WorkoutProgram WorkoutProgram { get; set; } = null!;
    public virtual ICollection<Exercise> Exercises { get; set; } = new List<Exercise>();
}

