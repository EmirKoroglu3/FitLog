using FitLog.Domain.Common;

namespace FitLog.Domain.Entities;

/// <summary>
/// Kullanıcı entity'si.
/// ASP.NET Identity ile entegre edilecek.
/// </summary>
public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    
    // Navigation Properties
    public virtual ICollection<WorkoutProgram> WorkoutPrograms { get; set; } = new List<WorkoutProgram>();
    public virtual ICollection<NutritionLog> NutritionLogs { get; set; } = new List<NutritionLog>();
    public virtual ICollection<Supplement> Supplements { get; set; } = new List<Supplement>();
}

