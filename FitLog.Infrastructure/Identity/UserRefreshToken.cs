namespace FitLog.Infrastructure.Identity;

/// <summary>
/// One row per signed-in device. Only the SHA-256 hash of the token is stored, so a database
/// leak doesn't expose usable tokens. Rotated on every refresh.
/// </summary>
public class UserRefreshToken
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string TokenHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
}
