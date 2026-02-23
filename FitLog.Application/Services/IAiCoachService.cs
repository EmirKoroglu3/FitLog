using FitLog.Application.DTOs.AiCoach;

namespace FitLog.Application.Services;

/// <summary>
/// AI Coach servisi arayüzü.
/// Son 30 günlük antrenman ve beslenme verisini analiz edip AI önerisi üretir.
/// </summary>
public interface IAiCoachService
{
    /// <summary>
    /// Kullanıcı için AI Coach analizi yapar ve rapor döner.
    /// </summary>
    Task<AiCoachAnalysisResponseDto> AnalyzeAsync(
        Guid userId,
        AiCoachAnalysisRequestDto request,
        CancellationToken cancellationToken = default);
}
