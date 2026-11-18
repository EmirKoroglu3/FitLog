using FitLog.Application.DTOs.Workout;
using FitLog.Application.Interfaces;
using FitLog.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitLog.API.Controllers;

/// <summary>
/// Workout endpoint'leri.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WorkoutController : ControllerBase
{
    private readonly IWorkoutService _workoutService;
    private readonly ICurrentUserService _currentUserService;

    public WorkoutController(IWorkoutService workoutService, ICurrentUserService currentUserService)
    {
        _workoutService = workoutService;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Kullanıcının tüm antrenman programlarını getirir.
    /// </summary>
    [HttpGet("programs")]
    [ProducesResponseType(typeof(List<WorkoutProgramDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPrograms(CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId!.Value;
        var programs = await _workoutService.GetUserWorkoutProgramsAsync(userId, cancellationToken);
        return Ok(programs);
    }

    /// <summary>
    /// Belirli bir antrenman programını getirir.
    /// </summary>
    [HttpGet("programs/{id:guid}")]
    [ProducesResponseType(typeof(WorkoutProgramDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProgram(Guid id, [FromServices] IResourceOwnershipService ownership, CancellationToken cancellationToken)
    {
        if (!await ownership.OwnsProgramAsync(_currentUserService.UserId!.Value, id, cancellationToken))
            return NotFound(new { message = "Kayıt bulunamadı." });

        var program = await _workoutService.GetWorkoutProgramByIdAsync(id, cancellationToken);
        if (program == null)
            return NotFound(new { message = "Program bulunamadı." });

        return Ok(program);
    }

    /// <summary>
    /// Yeni antrenman programı oluşturur.
    /// </summary>
    [HttpPost("programs")]
    [ProducesResponseType(typeof(WorkoutProgramDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateProgram([FromBody] CreateWorkoutProgramRequest request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId!.Value;
        var program = await _workoutService.CreateWorkoutProgramAsync(userId, request, cancellationToken);
        return CreatedAtAction(nameof(GetProgram), new { id = program.Id }, program);
    }

    /// <summary>
    /// Antrenman programını günceller.
    /// </summary>
    [HttpPut("programs/{id:guid}")]
    [ProducesResponseType(typeof(WorkoutProgramDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProgram(Guid id, [FromBody] UpdateWorkoutProgramRequest request, [FromServices] IResourceOwnershipService ownership, CancellationToken cancellationToken)
    {
        if (!await ownership.OwnsProgramAsync(_currentUserService.UserId!.Value, id, cancellationToken))
            return NotFound(new { message = "Kayıt bulunamadı." });

        var program = await _workoutService.UpdateWorkoutProgramAsync(id, request, cancellationToken);
        if (program == null)
            return NotFound(new { message = "Program bulunamadı." });

        return Ok(program);
    }

    /// <summary>
    /// Antrenman programını siler.
    /// </summary>
    [HttpDelete("programs/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProgram(Guid id, [FromServices] IResourceOwnershipService ownership, CancellationToken cancellationToken)
    {
        if (!await ownership.OwnsProgramAsync(_currentUserService.UserId!.Value, id, cancellationToken))
            return NotFound(new { message = "Kayıt bulunamadı." });

        var result = await _workoutService.DeleteWorkoutProgramAsync(id, cancellationToken);
        if (!result)
            return NotFound(new { message = "Program bulunamadı." });

        return NoContent();
    }

    // Workout Days
    /// <summary>
    /// Yeni antrenman günü ekler.
    /// </summary>
    [HttpPost("days")]
    [ProducesResponseType(typeof(WorkoutDayDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateDay([FromBody] CreateWorkoutDayRequest request, [FromServices] IResourceOwnershipService ownership, CancellationToken cancellationToken)
    {
        if (!await ownership.OwnsProgramAsync(_currentUserService.UserId!.Value, request.WorkoutProgramId, cancellationToken))
            return NotFound(new { message = "Kayıt bulunamadı." });

        var day = await _workoutService.CreateWorkoutDayAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetProgram), new { id = request.WorkoutProgramId }, day);
    }

    /// <summary>
    /// Antrenman gününü günceller.
    /// </summary>
    [HttpPut("days/{id:guid}")]
    [ProducesResponseType(typeof(WorkoutDayDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateDay(Guid id, [FromBody] UpdateWorkoutDayRequest request, [FromServices] IResourceOwnershipService ownership, CancellationToken cancellationToken)
    {
        if (!await ownership.OwnsDayAsync(_currentUserService.UserId!.Value, id, cancellationToken))
            return NotFound(new { message = "Kayıt bulunamadı." });

        var day = await _workoutService.UpdateWorkoutDayAsync(id, request, cancellationToken);
        if (day == null)
            return NotFound(new { message = "Gün bulunamadı." });

        return Ok(day);
    }

    /// <summary>
    /// Antrenman gününü siler.
    /// </summary>
    [HttpDelete("days/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteDay(Guid id, [FromServices] IResourceOwnershipService ownership, CancellationToken cancellationToken)
    {
        if (!await ownership.OwnsDayAsync(_currentUserService.UserId!.Value, id, cancellationToken))
            return NotFound(new { message = "Kayıt bulunamadı." });

        var result = await _workoutService.DeleteWorkoutDayAsync(id, cancellationToken);
        if (!result)
            return NotFound(new { message = "Gün bulunamadı." });

        return NoContent();
    }

    /// <summary>
    /// Günün egzersiz sırasını değiştirir (tüm egzersiz id'leri, ilkten sona).
    /// </summary>
    [HttpPut("days/{id:guid}/exercise-order")]
    [ProducesResponseType(typeof(List<ExerciseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ReorderExercises(Guid id, [FromBody] ReorderExercisesRequest request, [FromServices] IResourceOwnershipService ownership, CancellationToken cancellationToken)
    {
        if (!await ownership.OwnsDayAsync(_currentUserService.UserId!.Value, id, cancellationToken))
            return NotFound(new { message = "Kayıt bulunamadı." });

        var exercises = await _workoutService.ReorderExercisesAsync(id, request.ExerciseIds, cancellationToken);
        if (exercises == null)
            return BadRequest(new { message = "Liste bu günün egzersizleriyle eşleşmiyor." });

        return Ok(exercises);
    }

    // Exercises
    /// <summary>
    /// Yeni egzersiz ekler.
    /// </summary>
    [HttpPost("exercises")]
    [ProducesResponseType(typeof(ExerciseDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateExercise([FromBody] CreateExerciseRequest request, [FromServices] IResourceOwnershipService ownership, CancellationToken cancellationToken)
    {
        if (!await ownership.OwnsDayAsync(_currentUserService.UserId!.Value, request.WorkoutDayId, cancellationToken))
            return NotFound(new { message = "Kayıt bulunamadı." });

        var exercise = await _workoutService.CreateExerciseAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetProgram), new { id = request.WorkoutDayId }, exercise);
    }

    /// <summary>
    /// Egzersizi günceller.
    /// </summary>
    [HttpPut("exercises/{id:guid}")]
    [ProducesResponseType(typeof(ExerciseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateExercise(Guid id, [FromBody] UpdateExerciseRequest request, [FromServices] IResourceOwnershipService ownership, CancellationToken cancellationToken)
    {
        if (!await ownership.OwnsExerciseAsync(_currentUserService.UserId!.Value, id, cancellationToken))
            return NotFound(new { message = "Kayıt bulunamadı." });

        var exercise = await _workoutService.UpdateExerciseAsync(id, request, cancellationToken);
        if (exercise == null)
            return NotFound(new { message = "Egzersiz bulunamadı." });

        return Ok(exercise);
    }

    /// <summary>
    /// Egzersizi siler.
    /// </summary>
    [HttpDelete("exercises/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteExercise(Guid id, [FromServices] IResourceOwnershipService ownership, CancellationToken cancellationToken)
    {
        if (!await ownership.OwnsExerciseAsync(_currentUserService.UserId!.Value, id, cancellationToken))
            return NotFound(new { message = "Kayıt bulunamadı." });

        var result = await _workoutService.DeleteExerciseAsync(id, cancellationToken);
        if (!result)
            return NotFound(new { message = "Egzersiz bulunamadı." });

        return NoContent();
    }
}

