using FitLog.Domain.Common;

namespace FitLog.Domain.Entities;

/// <summary>
/// Beslenme kaydı entity'si.
/// Kullanıcının günlük beslenme takibi için.
/// </summary>
public class NutritionLog : BaseEntity
{
    public Guid UserId { get; set; }
    public DateTime Date { get; set; }
    public int Calories { get; set; }
    public decimal Protein { get; set; } // gram
    public decimal? Carbohydrates { get; set; } // gram
    public decimal? Fat { get; set; } // gram
    public string? MealType { get; set; } // Örn: "Kahvaltı", "Öğle", "Akşam"
    public string? Notes { get; set; }
    
    // Navigation Property
    public virtual User User { get; set; } = null!;
}

