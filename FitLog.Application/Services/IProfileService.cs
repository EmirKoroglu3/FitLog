using FitLog.Application.DTOs.Profile;

namespace FitLog.Application.Services;

public interface IProfileService
{
    Task<ProfileDto?> GetProfileAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<ProfileDto?> UpdateProfileAsync(Guid userId, UpdateProfileRequest request, CancellationToken cancellationToken = default);
    Task<ProfileAnalysis> GetProfileAnalysisAsync(Guid userId, CancellationToken cancellationToken = default);
}

