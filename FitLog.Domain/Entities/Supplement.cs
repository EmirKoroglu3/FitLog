using FitLog.Domain.Common;

namespace FitLog.Domain.Entities;

/// <summary>
/// Supplement (takviye) entity'si.
/// Kullanıcının aldığı takviyelerin takibi için.
/// </summary>
public class Supplement : BaseEntity
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? UsageNote { get; set; } // Kullanım notu
    public string? Dosage { get; set; } // Doz bilgisi
    public string? Timing { get; set; } // Örn: "Sabah", "Antrenman Öncesi"
    
    // Navigation Property
    public virtual User User { get; set; } = null!;
}

