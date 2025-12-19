namespace FitLog.Application.DTOs.Auth;

/// <summary>
/// Şifre sıfırlama isteği (email bazlı).
/// </summary>
public class ForgotPasswordRequest
{
    public string Email { get; set; } = string.Empty;
}
