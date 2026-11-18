namespace FitLog.Application.DTOs.Admin;

public class AdminStatsDto
{
    public int TotalUsers { get; set; }
    /// <summary>Users who logged in, trained or logged a meal in the last 7 days.</summary>
    public int ActiveLast7Days { get; set; }
    public int NewLast7Days { get; set; }
    public int LockedUsers { get; set; }
    public int TotalWorkouts { get; set; }
    public int TotalMeals { get; set; }
}

public class AdminUserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public DateTime? LastActivity { get; set; }
    public int WorkoutCount { get; set; }
    public int MealCount { get; set; }
    public bool IsLocked { get; set; }
    public bool IsAdmin { get; set; }
}

public class AdminUserPageDto
{
    public List<AdminUserDto> Items { get; set; } = new();
    public int Total { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}

/// <summary>Outcome of an admin action on a user.</summary>
public enum AdminActionResult
{
    Ok,
    NotFound,
    /// <summary>Not allowed on yourself or on another admin.</summary>
    Forbidden,
    Failed,
}
