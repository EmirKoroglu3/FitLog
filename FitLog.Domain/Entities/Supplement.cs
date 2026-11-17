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

    // Nutrition per serving (e.g. 1 scoop of whey). Added to the daily totals on days it is marked as taken.
    public int? Calories { get; set; }
    public decimal? Protein { get; set; }
    public decimal? Carbohydrates { get; set; }
    public decimal? Fat { get; set; }
    
    // Navigation Property
    public virtual User User { get; set; } = null!;
}

