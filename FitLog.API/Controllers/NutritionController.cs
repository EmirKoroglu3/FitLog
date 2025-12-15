using FitLog.Application.DTOs.Nutrition;
using FitLog.Application.Interfaces;
using FitLog.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitLog.API.Controllers;

/// <summary>
/// Nutrition endpoint'leri.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NutritionController : ControllerBase
{
    private readonly INutritionService _nutritionService;
    private readonly ICurrentUserService _currentUserService;

    public NutritionController(INutritionService nutritionService, ICurrentUserService currentUserService)
    {
        _nutritionService = nutritionService;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Kullanıcının beslenme kayıtlarını getirir.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<NutritionLogDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLogs([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId!.Value;
        var logs = await _nutritionService.GetUserNutritionLogsAsync(userId, startDate, endDate, cancellationToken);
        return Ok(logs);
    }

    /// <summary>
    /// Belirli bir beslenme kaydını getirir.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(NutritionLogDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetLog(Guid id, CancellationToken cancellationToken)
    {
        var log = await _nutritionService.GetNutritionLogByIdAsync(id, cancellationToken);
        if (log == null)
            return NotFound(new { message = "Kayıt bulunamadı." });

        return Ok(log);
    }

    /// <summary>
    /// Günlük beslenme özetini getirir.
    /// </summary>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(NutritionSummaryDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDailySummary([FromQuery] DateTime? date, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId!.Value;
        var targetDate = date ?? DateTime.UtcNow;
        var summary = await _nutritionService.GetDailySummaryAsync(userId, targetDate, cancellationToken);
        return Ok(summary);
    }

    /// <summary>
    /// Yeni beslenme kaydı oluşturur.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(NutritionLogDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateLog([FromBody] CreateNutritionLogRequest request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId!.Value;
        var log = await _nutritionService.CreateNutritionLogAsync(userId, request, cancellationToken);
        return CreatedAtAction(nameof(GetLog), new { id = log.Id }, log);
    }

    /// <summary>
    /// Beslenme kaydını günceller.
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(NutritionLogDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateLog(Guid id, [FromBody] UpdateNutritionLogRequest request, CancellationToken cancellationToken)
    {
        var log = await _nutritionService.UpdateNutritionLogAsync(id, request, cancellationToken);
        if (log == null)
            return NotFound(new { message = "Kayıt bulunamadı." });

        return Ok(log);
    }

    /// <summary>
    /// Beslenme kaydını siler.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteLog(Guid id, CancellationToken cancellationToken)
    {
        var result = await _nutritionService.DeleteNutritionLogAsync(id, cancellationToken);
        if (!result)
            return NotFound(new { message = "Kayıt bulunamadı." });

        return NoContent();
    }
}

