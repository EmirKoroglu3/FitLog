namespace FitLog.Application.DTOs.Auth;

/// <summary>
/// Authentication yanıt DTO'su.
/// </summary>
public class AuthResponse
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public string? Token { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? TokenExpiration { get; set; }
    public UserDto? User { get; set; }
    public List<string> Errors { get; set; } = new();
}

public class UserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    /// <summary>True for emails listed in the server's Admin__Emails setting.</summary>
    public bool IsAdmin { get; set; }
}

