namespace FitLog.Application.DTOs.Auth;

/// <summary>
/// Şifre sıfırlama (token ile yeni şifre belirleme).
/// </summary>
public class ResetPasswordRequest
{
    public Guid UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
}
