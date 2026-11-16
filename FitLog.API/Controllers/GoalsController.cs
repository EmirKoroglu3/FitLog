using FitLog.Application.DTOs.Tracking;
using FitLog.Application.Interfaces;
using FitLog.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitLog.API.Controllers;

/// <summary>Fitness goals and one-rep-max records.</summary>
[ApiController]
[Route("api/goals")]
[Authorize]
public class GoalsController : ControllerBase
{
    private readonly IGoalService _goals;
    private readonly ICurrentUserService _currentUser;

    public GoalsController(IGoalService goals, ICurrentUserService currentUser)
    {
        _goals = goals;
        _currentUser = currentUser;
    }

    private Guid UserId => _currentUser.UserId!.Value;

    [HttpGet]
    public async Task<ActionResult<List<FitnessGoalDto>>> List(CancellationToken ct) =>
        Ok(await _goals.GetGoalsAsync(UserId, ct));

    [HttpPost]
    public async Task<ActionResult<FitnessGoalDto>> Create([FromBody] SaveFitnessGoalRequest request, CancellationToken ct) =>
        Ok(await _goals.CreateGoalAsync(UserId, request, ct));

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<FitnessGoalDto>> Update(Guid id, [FromBody] SaveFitnessGoalRequest request, CancellationToken ct) =>
        await _goals.UpdateGoalAsync(UserId, id, request, ct) is { } g ? Ok(g) : NotFound();

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct) =>
        await _goals.DeleteGoalAsync(UserId, id, ct) ? NoContent() : NotFound();

    [HttpGet("one-rep-max")]
    public async Task<ActionResult<List<OneRepMaxRecordDto>>> OneRepMax(CancellationToken ct) =>
        Ok(await _goals.GetOneRepMaxRecordsAsync(UserId, ct));

    [HttpPost("one-rep-max")]
    public async Task<ActionResult<OneRepMaxRecordDto>> AddOneRepMax([FromBody] SaveOneRepMaxRequest request, CancellationToken ct) =>
        Ok(await _goals.AddOneRepMaxAsync(UserId, request, ct));

    [HttpDelete("one-rep-max/{id:guid}")]
    public async Task<IActionResult> DeleteOneRepMax(Guid id, CancellationToken ct) =>
        await _goals.DeleteOneRepMaxAsync(UserId, id, ct) ? NoContent() : NotFound();
}

/// <summary>User preferences and daily targets.</summary>
[ApiController]
[Route("api/settings")]
[Authorize]
public class SettingsController : ControllerBase
{
    private readonly IUserSettingsService _settings;
    private readonly ICurrentUserService _currentUser;

    public SettingsController(IUserSettingsService settings, ICurrentUserService currentUser)
    {
        _settings = settings;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<ActionResult<UserSettingsDto>> Get(CancellationToken ct) =>
        Ok(await _settings.GetAsync(_currentUser.UserId!.Value, ct));

    [HttpPut]
    public async Task<ActionResult<UserSettingsDto>> Save([FromBody] SaveUserSettingsRequest request, CancellationToken ct) =>
        Ok(await _settings.SaveAsync(_currentUser.UserId!.Value, request, ct));
}

/// <summary>Foods the user created themselves.</summary>
[ApiController]
[Route("api/foods/custom")]
[Authorize]
public class CustomFoodsController : ControllerBase
{
    private readonly ICustomFoodService _foods;
    private readonly ICurrentUserService _currentUser;

    public CustomFoodsController(ICustomFoodService foods, ICurrentUserService currentUser)
    {
        _foods = foods;
        _currentUser = currentUser;
    }

    private Guid UserId => _currentUser.UserId!.Value;

    [HttpGet]
    public async Task<ActionResult<List<CustomFoodDto>>> List(CancellationToken ct) =>
        Ok(await _foods.GetAllAsync(UserId, ct));

    [HttpPost]
    public async Task<ActionResult<CustomFoodDto>> Create([FromBody] SaveCustomFoodRequest request, CancellationToken ct) =>
        Ok(await _foods.CreateAsync(UserId, request, ct));

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CustomFoodDto>> Update(Guid id, [FromBody] SaveCustomFoodRequest request, CancellationToken ct) =>
        await _foods.UpdateAsync(UserId, id, request, ct) is { } f ? Ok(f) : NotFound();

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct) =>
        await _foods.DeleteAsync(UserId, id, ct) ? NoContent() : NotFound();
}

/// <summary>"Taken today" check-offs for supplements.</summary>
[ApiController]
[Route("api/supplement-intake")]
[Authorize]
public class SupplementIntakeController : ControllerBase
{
    private readonly ISupplementIntakeService _intake;
    private readonly ICurrentUserService _currentUser;

    public SupplementIntakeController(ISupplementIntakeService intake, ICurrentUserService currentUser)
    {
        _intake = intake;
        _currentUser = currentUser;
    }

    private Guid UserId => _currentUser.UserId!.Value;

    [HttpGet]
    public async Task<ActionResult<List<SupplementIntakeDto>>> ForDate([FromQuery] DateOnly date, CancellationToken ct) =>
        Ok(await _intake.GetForDateAsync(UserId, date, ct));

    [HttpPut("{supplementId:guid}/{date}")]
    public async Task<ActionResult<SupplementIntakeDto>> Mark(Guid supplementId, DateOnly date, CancellationToken ct) =>
        await _intake.MarkTakenAsync(UserId, supplementId, date, ct) is { } i ? Ok(i) : NotFound();

    [HttpDelete("{supplementId:guid}/{date}")]
    public async Task<IActionResult> Unmark(Guid supplementId, DateOnly date, CancellationToken ct) =>
        await _intake.UnmarkAsync(UserId, supplementId, date, ct) ? NoContent() : NotFound();
}
