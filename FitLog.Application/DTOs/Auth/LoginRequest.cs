namespace FitLog.Application.DTOs.Auth;

/// <summary>
/// Kullanıcı giriş isteği DTO'su.
/// </summary>
public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

