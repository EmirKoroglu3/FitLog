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
}

public class CreateSupplementRequest
{
    public string Name { get; set; } = string.Empty;
    public string? UsageNote { get; set; }
    public string? Dosage { get; set; }
    public string? Timing { get; set; }
}

public class UpdateSupplementRequest
{
    public string Name { get; set; } = string.Empty;
    public string? UsageNote { get; set; }
    public string? Dosage { get; set; }
    public string? Timing { get; set; }
}

