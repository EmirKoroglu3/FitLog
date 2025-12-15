namespace FitLog.Domain.Common;

/// <summary>
/// Tüm entity'lerin türeteceği temel sınıf.
/// Id, CreatedDate ve UpdatedDate alanlarını içerir.
/// </summary>
public abstract class BaseEntity
{
    public Guid Id { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }
}

