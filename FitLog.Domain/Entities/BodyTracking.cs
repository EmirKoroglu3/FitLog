using FitLog.Domain.Common;

namespace FitLog.Domain.Entities;

/// <summary>Body weight / body-fat / circumference measurement on a given day.</summary>
public class BodyMeasurement : BaseEntity
{
    public Guid UserId { get; set; }
    public DateOnly Date { get; set; }

    public decimal? WeightKg { get; set; }
    public decimal? BodyFatPercent { get; set; }

    // Circumferences in cm
    public decimal? Chest { get; set; }
    public decimal? Waist { get; set; }
    public decimal? Hips { get; set; }
    public decimal? Biceps { get; set; }
    public decimal? Thigh { get; set; }
    public decimal? Calf { get; set; }
    public decimal? Neck { get; set; }
}

/// <summary>Glasses of water drunk on a given day (one row per user per day).</summary>
public class WaterLog : BaseEntity
{
    public Guid UserId { get; set; }
    public DateOnly Date { get; set; }
    public int Glasses { get; set; }
}

/// <summary>
/// Progress photo. Stored as a small, client-resized JPEG in the database so it works on
/// hosts without persistent disk.
/// </summary>
public class ProgressPhoto : BaseEntity
{
    public Guid UserId { get; set; }
    public DateOnly Date { get; set; }
    public string? Note { get; set; }
    /// <summary>front | side | back</summary>
    public string Pose { get; set; } = "front";
    public string ContentType { get; set; } = "image/jpeg";
    public byte[] ImageData { get; set; } = Array.Empty<byte>();
}
