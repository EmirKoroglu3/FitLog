namespace FitLog.Application.DTOs.Profile;

public class ProfileDto
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public decimal? Height { get; set; }
    public decimal? Weight { get; set; }
    public string? Gender { get; set; }
    public DateTime? BirthDate { get; set; }
    public string? FitnessGoal { get; set; }
    public string? ExperienceLevel { get; set; }
    public int? Age { get; set; }
    public decimal? Bmi { get; set; }
    public string? BmiCategory { get; set; }
}

public class UpdateProfileRequest
{
    public string? Name { get; set; }
    public string? Surname { get; set; }
    public decimal? Height { get; set; }
    public decimal? Weight { get; set; }
    public string? Gender { get; set; }
    public DateTime? BirthDate { get; set; }
    public string? FitnessGoal { get; set; }
    public string? ExperienceLevel { get; set; }
}

public class ProfileRecommendation
{
    public string Category { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
}

public class ProfileAnalysis
{
    public ProfileDto Profile { get; set; } = null!;
    public List<ProfileRecommendation> Recommendations { get; set; } = new();
    public string SuggestedProgram { get; set; } = string.Empty;
    public int DailyCalorieNeed { get; set; }
    public int DailyProteinNeed { get; set; }
}

