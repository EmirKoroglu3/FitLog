using FitLog.Domain.Common;

namespace FitLog.Domain.Entities;

/// <summary>
/// Antrenman programı entity'si.
/// Bir kullanıcının birden fazla programı olabilir.
/// </summary>
public class WorkoutProgram : BaseEntity
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    // Navigation Properties
    public virtual User User { get; set; } = null!;
    public virtual ICollection<WorkoutDay> WorkoutDays { get; set; } = new List<WorkoutDay>();
}

