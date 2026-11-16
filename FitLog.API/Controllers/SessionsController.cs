using FitLog.Application.DTOs.Tracking;
using FitLog.Application.Interfaces;
using FitLog.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitLog.API.Controllers;

/// <summary>
/// Performed workouts (sessions + sets) and the statistics derived from them.
/// </summary>
[ApiController]
[Route("api/sessions")]
[Authorize]
public class SessionsController : ControllerBase
{
    private readonly IWorkoutSessionService _sessions;
    private readonly ICurrentUserService _currentUser;

    public SessionsController(IWorkoutSessionService sessions, ICurrentUserService currentUser)
    {
        _sessions = sessions;
        _currentUser = currentUser;
    }

    private Guid UserId => _currentUser.UserId!.Value;

    /// <summary>Lists sessions, newest first. Optional UTC range [from, to).</summary>
    [HttpGet]
    public async Task<ActionResult<List<WorkoutSessionDto>>> List(
        [FromQuery] DateTime? from, [FromQuery] DateTime? to, [FromQuery] bool includeSets = false, CancellationToken ct = default) =>
        Ok(await _sessions.GetSessionsAsync(UserId, from, to, includeSets, ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<WorkoutSessionDto>> Get(Guid id, CancellationToken ct) =>
        await _sessions.GetSessionAsync(UserId, id, ct) is { } s ? Ok(s) : NotFound();

    [HttpPost]
    public async Task<ActionResult<WorkoutSessionDto>> Create([FromBody] SaveWorkoutSessionRequest request, CancellationToken ct)
    {
        var session = await _sessions.CreateSessionAsync(UserId, request, ct);
        return CreatedAtAction(nameof(Get), new { id = session.Id }, session);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<WorkoutSessionDto>> Update(Guid id, [FromBody] SaveWorkoutSessionRequest request, CancellationToken ct) =>
        await _sessions.UpdateSessionAsync(UserId, id, request, ct) is { } s ? Ok(s) : NotFound();

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct) =>
        await _sessions.DeleteSessionAsync(UserId, id, ct) ? NoContent() : NotFound();

    /// <summary>Exercise names that have logged working sets (for chart pickers).</summary>
    [HttpGet("exercises")]
    public async Task<ActionResult<List<string>>> Exercises(CancellationToken ct) =>
        Ok(await _sessions.GetLoggedExerciseNamesAsync(UserId, ct));

    /// <summary>Per-session best set, estimated 1RM and volume for one exercise.</summary>
    [HttpGet("exercise-history")]
    public async Task<ActionResult<List<ExerciseHistoryPoint>>> ExerciseHistory([FromQuery] string name, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(name)) return BadRequest(new { message = "name zorunlu." });
        return Ok(await _sessions.GetExerciseHistoryAsync(UserId, name.Trim(), ct));
    }

    [HttpGet("weekly-volume")]
    public async Task<ActionResult<List<WeeklyVolumePoint>>> WeeklyVolume([FromQuery] int weeks = 12, CancellationToken ct = default) =>
        Ok(await _sessions.GetWeeklyVolumeAsync(UserId, weeks, ct));

    [HttpGet("personal-records")]
    public async Task<ActionResult<List<PersonalRecordDto>>> PersonalRecords(CancellationToken ct) =>
        Ok(await _sessions.GetPersonalRecordsAsync(UserId, ct));
}
