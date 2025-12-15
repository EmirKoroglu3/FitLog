using FitLog.Application.DTOs.Supplement;
using FitLog.Application.Interfaces;
using FitLog.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitLog.API.Controllers;

/// <summary>
/// Supplement endpoint'leri.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SupplementController : ControllerBase
{
    private readonly ISupplementService _supplementService;
    private readonly ICurrentUserService _currentUserService;

    public SupplementController(ISupplementService supplementService, ICurrentUserService currentUserService)
    {
        _supplementService = supplementService;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Kullanıcının tüm supplement'larını getirir.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<SupplementDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSupplements(CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId!.Value;
        var supplements = await _supplementService.GetUserSupplementsAsync(userId, cancellationToken);
        return Ok(supplements);
    }

    /// <summary>
    /// Belirli bir supplement'ı getirir.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(SupplementDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSupplement(Guid id, CancellationToken cancellationToken)
    {
        var supplement = await _supplementService.GetSupplementByIdAsync(id, cancellationToken);
        if (supplement == null)
            return NotFound(new { message = "Supplement bulunamadı." });

        return Ok(supplement);
    }

    /// <summary>
    /// Yeni supplement oluşturur.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(SupplementDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateSupplement([FromBody] CreateSupplementRequest request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId!.Value;
        var supplement = await _supplementService.CreateSupplementAsync(userId, request, cancellationToken);
        return CreatedAtAction(nameof(GetSupplement), new { id = supplement.Id }, supplement);
    }

    /// <summary>
    /// Supplement'ı günceller.
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(SupplementDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateSupplement(Guid id, [FromBody] UpdateSupplementRequest request, CancellationToken cancellationToken)
    {
        var supplement = await _supplementService.UpdateSupplementAsync(id, request, cancellationToken);
        if (supplement == null)
            return NotFound(new { message = "Supplement bulunamadı." });

        return Ok(supplement);
    }

    /// <summary>
    /// Supplement'ı siler.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteSupplement(Guid id, CancellationToken cancellationToken)
    {
        var result = await _supplementService.DeleteSupplementAsync(id, cancellationToken);
        if (!result)
            return NotFound(new { message = "Supplement bulunamadı." });

        return NoContent();
    }
}

