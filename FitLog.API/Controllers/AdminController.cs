using FitLog.Application.DTOs.Admin;
using FitLog.Application.Interfaces;
using FitLog.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitLog.API.Controllers;

/// <summary>
/// User management. Only tokens carrying the Admin role (emails listed in Admin__Emails) get in.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;
    private readonly ICurrentUserService _currentUserService;

    public AdminController(IAdminService adminService, ICurrentUserService currentUserService)
    {
        _adminService = adminService;
        _currentUserService = currentUserService;
    }

    [HttpGet("stats")]
    [ProducesResponseType(typeof(AdminStatsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStats(CancellationToken ct) => Ok(await _adminService.GetStatsAsync(ct));

    [HttpGet("users")]
    [ProducesResponseType(typeof(AdminUserPageDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUsers([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default) =>
        Ok(await _adminService.GetUsersAsync(search, page, pageSize, ct));

    [HttpPost("users/{id:guid}/lock")]
    public async Task<IActionResult> Lock(Guid id, CancellationToken ct) =>
        ToResult(await _adminService.SetLockedAsync(_currentUserService.UserId!.Value, id, true, ct), "Hesap askıya alındı.");

    [HttpPost("users/{id:guid}/unlock")]
    public async Task<IActionResult> Unlock(Guid id, CancellationToken ct) =>
        ToResult(await _adminService.SetLockedAsync(_currentUserService.UserId!.Value, id, false, ct), "Hesap yeniden açıldı.");

    [HttpPost("users/{id:guid}/password-reset")]
    public async Task<IActionResult> SendPasswordReset(Guid id, CancellationToken ct) =>
        ToResult(await _adminService.SendPasswordResetAsync(id, ct), "Şifre sıfırlama e-postası gönderildi.",
            failed: "E-posta gönderilemedi. E-posta servisi ayarlı mı?");

    [HttpDelete("users/{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct) =>
        ToResult(await _adminService.DeleteUserAsync(_currentUserService.UserId!.Value, id, ct), "Kullanıcı ve tüm verileri silindi.");

    private IActionResult ToResult(AdminActionResult result, string ok, string failed = "İşlem yapılamadı.") => result switch
    {
        AdminActionResult.Ok => Ok(new { message = ok }),
        AdminActionResult.NotFound => NotFound(new { message = "Kullanıcı bulunamadı." }),
        AdminActionResult.Forbidden => BadRequest(new { message = "Bu işlem kendi hesabına veya başka bir yöneticiye uygulanamaz." }),
        _ => StatusCode(StatusCodes.Status500InternalServerError, new { message = failed }),
    };
}
