namespace FitLog.Infrastructure.Services;

/// <summary>
/// JWT ayarları sınıfı.
/// appsettings.json'dan okunur.
/// </summary>
public class JwtSettings
{
    public string Secret { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int ExpirationInMinutes { get; set; } = 60;
    public int RefreshTokenExpirationInDays { get; set; } = 7;
}

