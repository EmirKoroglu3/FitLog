using FitLog.Application.DTOs.Admin;
using FitLog.Application.DTOs.Auth;
using FitLog.Application.Interfaces;
using FitLog.Application.Services;
using FitLog.Infrastructure.Identity;
using FitLog.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace FitLog.Infrastructure.Services;

public class AdminService : IAdminService
{
    private readonly FitLogDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IAuthService _authService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AdminService> _logger;

    public AdminService(
        FitLogDbContext db,
        UserManager<ApplicationUser> userManager,
        IAuthService authService,
        IConfiguration configuration,
        ILogger<AdminService> logger)
    {
        _db = db;
        _userManager = userManager;
        _authService = authService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<AdminStatsDto> GetStatsAsync(CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var since = now.AddDays(-7);
        var nowOffset = DateTimeOffset.UtcNow;

        // "Active" = logged in (refresh token issued), trained or logged a meal in the last 7 days
        var activeUserIds = _db.UserRefreshTokens.Where(t => t.CreatedAt >= since).Select(t => t.UserId)
            .Union(_db.WorkoutSessions.Where(s => s.StartedAt >= since).Select(s => s.UserId))
            .Union(_db.NutritionLogs.Where(n => n.CreatedDate >= since).Select(n => n.UserId));

        return new AdminStatsDto
        {
            TotalUsers = await _db.Users.CountAsync(ct),
            ActiveLast7Days = await activeUserIds.Distinct().CountAsync(ct),
            NewLast7Days = await _db.Users.CountAsync(u => u.CreatedDate >= since, ct),
            LockedUsers = await _db.Users.CountAsync(u => u.LockoutEnd != null && u.LockoutEnd > nowOffset, ct),
            TotalWorkouts = await _db.WorkoutSessions.CountAsync(ct),
            TotalMeals = await _db.NutritionLogs.CountAsync(ct),
        };
    }

    public async Task<AdminUserPageDto> GetUsersAsync(string? search, int page, int pageSize, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 5, 100);
        var nowOffset = DateTimeOffset.UtcNow;

        var users = _db.Users.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            users = users.Where(u =>
                u.Email!.ToLower().Contains(s) ||
                (u.Name + " " + u.Surname).ToLower().Contains(s));
        }

        var total = await users.CountAsync(ct);
        var rows = await users
            .OrderByDescending(u => u.CreatedDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.Name,
                u.Surname,
                u.CreatedDate,
                IsLocked = u.LockoutEnd != null && u.LockoutEnd > nowOffset,
                Workouts = _db.WorkoutSessions.Count(s => s.UserId == u.Id),
                Meals = _db.NutritionLogs.Count(n => n.UserId == u.Id),
                LastLogin = _db.UserRefreshTokens.Where(t => t.UserId == u.Id).Max(t => (DateTime?)t.CreatedAt),
                LastWorkout = _db.WorkoutSessions.Where(s => s.UserId == u.Id).Max(s => (DateTime?)s.StartedAt),
                LastMeal = _db.NutritionLogs.Where(n => n.UserId == u.Id).Max(n => (DateTime?)n.CreatedDate),
            })
            .ToListAsync(ct);

        return new AdminUserPageDto
        {
            Page = page,
            PageSize = pageSize,
            Total = total,
            Items = rows.Select(r => new AdminUserDto
            {
                Id = r.Id,
                Email = r.Email ?? string.Empty,
                Name = r.Name,
                Surname = r.Surname,
                CreatedDate = r.CreatedDate,
                LastActivity = new[] { r.LastLogin, r.LastWorkout, r.LastMeal }.Max(),
                WorkoutCount = r.Workouts,
                MealCount = r.Meals,
                IsLocked = r.IsLocked,
                IsAdmin = AdminAccess.IsAdminEmail(_configuration, r.Email),
            }).ToList(),
        };
    }

    public async Task<AdminActionResult> SetLockedAsync(Guid actingAdminId, Guid userId, bool locked, CancellationToken ct = default)
    {
        var (user, guard) = await FindTargetAsync(actingAdminId, userId);
        if (user == null) return guard;

        await _userManager.SetLockoutEnabledAsync(user, true);
        var result = await _userManager.SetLockoutEndDateAsync(user, locked ? DateTimeOffset.MaxValue : null);
        if (!result.Succeeded) return AdminActionResult.Failed;

        if (locked)
        {
            // Signed out everywhere: refresh tokens stop working, access tokens expire on their own
            await _db.UserRefreshTokens.Where(t => t.UserId == userId).ExecuteDeleteAsync(ct);
        }

        _logger.LogWarning("Admin {AdminId} {Action} user {UserId}", actingAdminId, locked ? "locked" : "unlocked", userId);
        return AdminActionResult.Ok;
    }

    public async Task<AdminActionResult> DeleteUserAsync(Guid actingAdminId, Guid userId, CancellationToken ct = default)
    {
        var (user, guard) = await FindTargetAsync(actingAdminId, userId);
        if (user == null) return guard;

        // All of the user's data is removed through cascade deletes
        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded) return AdminActionResult.Failed;

        _logger.LogWarning("Admin {AdminId} deleted user {UserId}", actingAdminId, userId);
        return AdminActionResult.Ok;
    }

    public async Task<AdminActionResult> SendPasswordResetAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user?.Email == null) return AdminActionResult.NotFound;

        var response = await _authService.ForgotPasswordAsync(new ForgotPasswordRequest { Email = user.Email }, ct);
        return response.Success ? AdminActionResult.Ok : AdminActionResult.Failed;
    }

    /// <summary>Loads the target user; admins can't lock or delete themselves or other admins.</summary>
    private async Task<(ApplicationUser? User, AdminActionResult Guard)> FindTargetAsync(Guid actingAdminId, Guid userId)
    {
        if (userId == actingAdminId) return (null, AdminActionResult.Forbidden);

        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return (null, AdminActionResult.NotFound);
        if (AdminAccess.IsAdminEmail(_configuration, user.Email)) return (null, AdminActionResult.Forbidden);

        return (user, AdminActionResult.Ok);
    }
}
