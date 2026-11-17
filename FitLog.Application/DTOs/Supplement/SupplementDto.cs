using System.ComponentModel.DataAnnotations;

namespace FitLog.Application.DTOs.Supplement;

/// <summary>
/// Supplement DTO'ları.
/// </summary>
public class SupplementDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? UsageNote { get; set; }
    public string? Dosage { get; set; }
    public string? Timing { get; set; }

    /// <summary>Per serving; counted in daily nutrition when the supplement is marked as taken.</summary>
    [Range(0, 3000)] public int? Calories { get; set; }
    [Range(0, 300)] public decimal? Protein { get; set; }
    [Range(0, 500)] public decimal? Carbohydrates { get; set; }
    [Range(0, 300)] public decimal? Fat { get; set; }
}

public class CreateSupplementRequest
{
    public string Name { get; set; } = string.Empty;
    public string? UsageNote { get; set; }
    public string? Dosage { get; set; }
    public string? Timing { get; set; }

    /// <summary>Per serving; counted in daily nutrition when the supplement is marked as taken.</summary>
    [Range(0, 3000)] public int? Calories { get; set; }
    [Range(0, 300)] public decimal? Protein { get; set; }
    [Range(0, 500)] public decimal? Carbohydrates { get; set; }
    [Range(0, 300)] public decimal? Fat { get; set; }
}

public class UpdateSupplementRequest
{
    public string Name { get; set; } = string.Empty;
    public string? UsageNote { get; set; }
    public string? Dosage { get; set; }
    public string? Timing { get; set; }

    /// <summary>Per serving; counted in daily nutrition when the supplement is marked as taken.</summary>
    [Range(0, 3000)] public int? Calories { get; set; }
    [Range(0, 300)] public decimal? Protein { get; set; }
    [Range(0, 500)] public decimal? Carbohydrates { get; set; }
    [Range(0, 300)] public decimal? Fat { get; set; }
}

