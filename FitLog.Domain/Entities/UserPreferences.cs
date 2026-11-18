using FitLog.Domain.Common;

namespace FitLog.Domain.Entities;

/// <summary>Per-user settings and daily targets (one row per user).</summary>
public class UserSettings : BaseEntity
{
    public Guid UserId { get; set; }

    // Daily nutrition targets (null = use the value derived from the profile)
    public int? CalorieTarget { get; set; }
    public int? ProteinTarget { get; set; }
    public int? CarbTarget { get; set; }
    public int? FatTarget { get; set; }
    public int WaterGoalGlasses { get; set; } = 8;

    // Training preferences
    /// <summary>kg | lbs</summary>
    public string WeightUnit { get; set; } = "kg";
    /// <summary>cm | inch</summary>
    public string MeasurementUnit { get; set; } = "cm";
    public int DefaultRestSeconds { get; set; } = 90;
    public bool SoundEffects { get; set; } = true;
    public bool Notifications { get; set; } = false;
    /// <summary>tr | en</summary>
    public string Language { get; set; } = "tr";

    /// <summary>Food ids (built-in or "custom:{guid}") the user starred, comma separated.</summary>
    public string FavoriteFoodIds { get; set; } = string.Empty;
}

/// <summary>A food the user defined themselves (values per serving).</summary>
public class CustomFood : BaseEntity
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal ServingSize { get; set; }
    public string ServingUnit { get; set; } = "g";
    public decimal Calories { get; set; }
    public decimal Protein { get; set; }
    public decimal Carbohydrates { get; set; }
    public decimal Fat { get; set; }
}

/// <summary>Marks that a supplement was taken on a given day.</summary>
public class SupplementIntake : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid SupplementId { get; set; }
    public DateOnly Date { get; set; }
    public DateTime TakenAt { get; set; }
}

/// <summary>A saved group of foods ("my usual breakfast") added to a meal in one tap.</summary>
public class MealTemplate : BaseEntity
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    /// <summary>JSON array of food snapshots with amounts, written and read by the client.</summary>
    public string ItemsJson { get; set; } = "[]";
}
