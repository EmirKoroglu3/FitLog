using FitLog.Application.DTOs.Tracking;
using FitLog.Application.Interfaces;
using FitLog.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitLog.API.Controllers;

/// <summary>Body measurements, daily water intake and progress photos.</summary>
[ApiController]
[Route("api/body")]
[Authorize]
public class BodyController : ControllerBase
{
    private readonly IBodyTrackingService _body;
    private readonly ICurrentUserService _currentUser;

    public BodyController(IBodyTrackingService body, ICurrentUserService currentUser)
    {
        _body = body;
        _currentUser = currentUser;
    }

    private Guid UserId => _currentUser.UserId!.Value;

    // ---- Measurements ----

    [HttpGet("measurements")]
    public async Task<ActionResult<List<BodyMeasurementDto>>> Measurements(CancellationToken ct) =>
        Ok(await _body.GetMeasurementsAsync(UserId, ct));

    [HttpPost("measurements")]
    public async Task<ActionResult<BodyMeasurementDto>> AddMeasurement([FromBody] SaveBodyMeasurementRequest request, CancellationToken ct) =>
        Ok(await _body.CreateMeasurementAsync(UserId, request, ct));

    [HttpPut("measurements/{id:guid}")]
    public async Task<ActionResult<BodyMeasurementDto>> UpdateMeasurement(Guid id, [FromBody] SaveBodyMeasurementRequest request, CancellationToken ct) =>
        await _body.UpdateMeasurementAsync(UserId, id, request, ct) is { } m ? Ok(m) : NotFound();

    [HttpDelete("measurements/{id:guid}")]
    public async Task<IActionResult> DeleteMeasurement(Guid id, CancellationToken ct) =>
        await _body.DeleteMeasurementAsync(UserId, id, ct) ? NoContent() : NotFound();

    // ---- Water ----

    /// <summary>Water logs between two local dates (inclusive), format yyyy-MM-dd.</summary>
    [HttpGet("water")]
    public async Task<ActionResult<List<WaterLogDto>>> Water([FromQuery] DateOnly from, [FromQuery] DateOnly to, CancellationToken ct)
    {
        if (to < from || to.DayNumber - from.DayNumber > 366)
            return BadRequest(new { message = "Geçersiz tarih aralığı." });
        return Ok(await _body.GetWaterLogsAsync(UserId, from, to, ct));
    }

    [HttpPut("water/{date}")]
    public async Task<ActionResult<WaterLogDto>> SetWater(DateOnly date, [FromBody] SetWaterRequest request, CancellationToken ct) =>
        Ok(await _body.SetWaterAsync(UserId, date, request.Glasses, ct));

    // ---- Photos ----

    [HttpGet("photos")]
    public async Task<ActionResult<List<ProgressPhotoDto>>> Photos(CancellationToken ct) =>
        Ok(await _body.GetPhotosAsync(UserId, ct));

    [HttpGet("photos/{id:guid}/image")]
    public async Task<IActionResult> PhotoImage(Guid id, CancellationToken ct)
    {
        var image = await _body.GetPhotoImageAsync(UserId, id, ct);
        if (image == null) return NotFound();
        Response.Headers.CacheControl = "private, max-age=86400";
        return File(image.Value.Data, image.Value.ContentType);
    }

    [HttpPost("photos")]
    [RequestSizeLimit(3_000_000)]
    public async Task<ActionResult<ProgressPhotoDto>> UploadPhoto([FromBody] UploadProgressPhotoRequest request, CancellationToken ct)
    {
        try
        {
            return Ok(await _body.UploadPhotoAsync(UserId, request, ct));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("photos/{id:guid}")]
    public async Task<IActionResult> DeletePhoto(Guid id, CancellationToken ct) =>
        await _body.DeletePhotoAsync(UserId, id, ct) ? NoContent() : NotFound();
}
