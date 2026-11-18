using FitLog.Application.DTOs.Admin;

namespace FitLog.Application.Services;

/// <summary>User management for admins (role checked by the controller).</summary>
public interface IAdminService
{
    Task<AdminStatsDto> GetStatsAsync(CancellationToken ct = default);
    Task<AdminUserPageDto> GetUsersAsync(string? search, int page, int pageSize, CancellationToken ct = default);
    Task<AdminActionResult> SetLockedAsync(Guid actingAdminId, Guid userId, bool locked, CancellationToken ct = default);
    Task<AdminActionResult> DeleteUserAsync(Guid actingAdminId, Guid userId, CancellationToken ct = default);
    Task<AdminActionResult> SendPasswordResetAsync(Guid userId, CancellationToken ct = default);
}
