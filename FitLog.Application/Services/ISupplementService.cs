using FitLog.Application.DTOs.Supplement;

namespace FitLog.Application.Services;

/// <summary>
/// Supplement servisi interface'i.
/// </summary>
public interface ISupplementService
{
    Task<List<SupplementDto>> GetUserSupplementsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<SupplementDto?> GetSupplementByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<SupplementDto> CreateSupplementAsync(Guid userId, CreateSupplementRequest request, CancellationToken cancellationToken = default);
    Task<SupplementDto?> UpdateSupplementAsync(Guid id, UpdateSupplementRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteSupplementAsync(Guid id, CancellationToken cancellationToken = default);
}

