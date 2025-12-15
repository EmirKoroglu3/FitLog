using FitLog.Application.DTOs.Profile;
using FitLog.Application.Interfaces;
using FitLog.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitLog.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;
    private readonly ICurrentUserService _currentUserService;

    public ProfileController(IProfileService profileService, ICurrentUserService currentUserService)
    {
        _profileService = profileService;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<ActionResult<ProfileDto>> GetProfile(CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (userId == null)
            return Unauthorized();

        var profile = await _profileService.GetProfileAsync(userId.Value, cancellationToken);
        if (profile == null)
            return NotFound();

        return Ok(profile);
    }

    [HttpPut]
    public async Task<ActionResult<ProfileDto>> UpdateProfile(
        [FromBody] UpdateProfileRequest request,
        CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (userId == null)
            return Unauthorized();

        var profile = await _profileService.UpdateProfileAsync(userId.Value, request, cancellationToken);
        if (profile == null)
            return NotFound();

        return Ok(profile);
    }

    [HttpGet("analysis")]
    public async Task<ActionResult<ProfileAnalysis>> GetProfileAnalysis(CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (userId == null)
            return Unauthorized();

        var analysis = await _profileService.GetProfileAnalysisAsync(userId.Value, cancellationToken);
        return Ok(analysis);
    }
}

