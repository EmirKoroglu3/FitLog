using FitLog.Application.DTOs.AiCoach;
using FitLog.Application.Interfaces;
using FitLog.Application.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitLog.API.Controllers;

/// <summary>
/// AI Coach analiz endpoint'leri.
/// </summary>
[ApiController]
[Route("api/aicoach")]
[Authorize]
public class AiCoachController : ControllerBase
{
    private readonly IAiCoachService _aiCoachService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IValidator<AiCoachAnalysisRequestDto> _validator;
    private readonly ILogger<AiCoachController> _logger;

    public AiCoachController(
        IAiCoachService aiCoachService,
        ICurrentUserService currentUserService,
        IValidator<AiCoachAnalysisRequestDto> validator,
        ILogger<AiCoachController> logger)
    {
        _aiCoachService = aiCoachService;
        _currentUserService = currentUserService;
        _validator = validator;
        _logger = logger;
    }

    /// <summary>
    /// Son 30 günlük antrenman ve beslenme verisine göre AI Coach analizi yapar.
    /// </summary>
    [HttpPost("analyze")]
    [ProducesResponseType(typeof(AiCoachAnalysisResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Analyze(
        [FromBody] AiCoachAnalysisRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var userId = _currentUserService.UserId;
        if (userId == null)
            return Unauthorized();

        var validationResult = await _validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Doğrulama hatası.",
                errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList()
            });
        }

        try
        {
            var result = await _aiCoachService.AnalyzeAsync(userId.Value, request, cancellationToken);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogError(ex, "AI Coach analizi başarısız. UserId: {UserId}", userId);
            return StatusCode(500, new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AI Coach analizi sırasında beklenmeyen hata. UserId: {UserId}", userId);
            return StatusCode(500, new { success = false, message = "Analiz sırasında bir hata oluştu." });
        }
    }
}
