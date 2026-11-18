using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using FitLog.Application.DTOs.Auth;
using FitLog.Application.Interfaces;
using FitLog.Infrastructure.Identity;
using FitLog.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace FitLog.Infrastructure.Services;

/// <summary>
/// Authentication servisi implementasyonu.
/// </summary>
public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly JwtSettings _jwtSettings;
    private readonly IEmailSender _emailSender;
    private readonly IConfiguration _configuration;

    private readonly FitLogDbContext _db;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        IOptions<JwtSettings> jwtSettings,
        IEmailSender emailSender,
        IConfiguration configuration,
        FitLogDbContext db,
        ILogger<AuthService> logger)
    {
        _db = db;
        _logger = logger;
        _userManager = userManager;
        _jwtSettings = jwtSettings.Value;
        _emailSender = emailSender;
        _configuration = configuration;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return new AuthResponse
            {
                Success = false,
                Message = "Bu email adresi zaten kullanılıyor.",
                Errors = new List<string> { "Email already exists" }
            };
        }

        var user = new ApplicationUser
        {
            Email = request.Email,
            UserName = request.Email,
            Name = request.Name,
            Surname = request.Surname,
            CreatedDate = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            return new AuthResponse
            {
                Success = false,
                Message = "Kullanıcı oluşturulamadı.",
                Errors = result.Errors.Select(e => e.Description).ToList()
            };
        }

        var token = GenerateJwtToken(user);
        var refreshToken = await IssueRefreshTokenAsync(user.Id, cancellationToken);

        return new AuthResponse
        {
            Success = true,
            Message = "Kayıt başarılı.",
            Token = token,
            RefreshToken = refreshToken,
            TokenExpiration = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes),
            User = ToUserDto(user)
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            return new AuthResponse
            {
                Success = false,
                Message = "Email veya şifre hatalı.",
                Errors = new List<string> { "Invalid credentials" }
            };
        }

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!isPasswordValid)
        {
            return new AuthResponse
            {
                Success = false,
                Message = "Email veya şifre hatalı.",
                Errors = new List<string> { "Invalid credentials" }
            };
        }

        // Suspended by an admin (only revealed after a correct password)
        if (await _userManager.IsLockedOutAsync(user))
        {
            return new AuthResponse
            {
                Success = false,
                Message = "Hesabın askıya alınmış. Bilgi için yöneticiyle iletişime geç.",
                Errors = new List<string> { "Account locked" }
            };
        }

        var token = GenerateJwtToken(user);
        var refreshToken = await IssueRefreshTokenAsync(user.Id, cancellationToken);

        return new AuthResponse
        {
            Success = true,
            Message = "Giriş başarılı.",
            Token = token,
            RefreshToken = refreshToken,
            TokenExpiration = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes),
            User = ToUserDto(user)
        };
    }

    public async Task<AuthResponse?> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(refreshToken)) return null;

        var hash = HashToken(refreshToken);
        var stored = await _db.UserRefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == hash, cancellationToken);
        if (stored == null || stored.ExpiresAt <= DateTime.UtcNow)
        {
            return null;
        }

        var user = await _userManager.FindByIdAsync(stored.UserId.ToString());
        if (user == null || await _userManager.IsLockedOutAsync(user)) return null;

        // Rotate: this device's old token stops working, other devices are unaffected.
        _db.UserRefreshTokens.Remove(stored);
        var newToken = GenerateJwtToken(user);
        var newRefreshToken = await IssueRefreshTokenAsync(user.Id, cancellationToken);

        return new AuthResponse
        {
            Success = true,
            Message = "Token yenilendi.",
            Token = newToken,
            RefreshToken = newRefreshToken,
            TokenExpiration = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes),
            User = ToUserDto(user)
        };
    }

    public async Task<AuthResponse> ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default)
    {
        const string genericMessage = "Eğer bu email ile kayıtlı bir hesabın varsa, şifre sıfırlama bağlantısı gönderildi. Gelen kutunu ve spam klasörünü kontrol et.";

        // Same answer for every email, so this can't be used to discover which accounts exist
        if (!_emailSender.IsConfigured)
        {
            _logger.LogError("Password reset requested but no email provider is configured (Resend:ApiKey).");
            return new AuthResponse
            {
                Success = false,
                Message = "Şifre sıfırlama e-postası şu an gönderilemiyor. Lütfen daha sonra tekrar dene."
            };
        }

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            return new AuthResponse { Success = true, Message = genericMessage };

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var frontendUrl = (Environment.GetEnvironmentVariable("FrontendUrl")
            ?? _configuration["FrontendUrl"]
            ?? "http://localhost:5173").TrimEnd('/');
        var resetLink = $"{frontendUrl}/reset-password?userId={user.Id}&token={Uri.EscapeDataString(token)}";
        var name = System.Net.WebUtility.HtmlEncode(user.Name);

        var body = $"""
            <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1c1917">
              <h2 style="margin:0 0 16px;color:#ea580c">FitLog</h2>
              <p>Merhaba {name},</p>
              <p>Şifreni sıfırlamak için aşağıdaki butona tıkla. Bağlantı <strong>1 saat</strong> geçerli.</p>
              <p style="margin:28px 0">
                <a href="{resetLink}" style="background:#ea580c;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold">Şifremi Sıfırla</a>
              </p>
              <p style="font-size:13px;color:#57534e">Buton çalışmazsa bu adresi tarayıcına yapıştır:<br><a href="{resetLink}" style="color:#ea580c;word-break:break-all">{resetLink}</a></p>
              <p style="font-size:13px;color:#57534e">Bu isteği sen yapmadıysan bu e-postayı görmezden gelebilirsin; şifren değişmez.</p>
            </div>
            """;

        try
        {
            await _emailSender.SendEmailAsync(user.Email!, "FitLog - Şifre Sıfırlama", body, cancellationToken);
        }
        catch (Exception ex)
        {
            // Logged, but the reply stays generic so it doesn't reveal that the account exists
            _logger.LogError(ex, "Password reset email could not be sent.");
        }

        return new AuthResponse { Success = true, Message = genericMessage };
    }

    public async Task<AuthResponse> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default)
    {
        if (request.NewPassword != request.ConfirmPassword)
        {
            return new AuthResponse
            {
                Success = false,
                Message = "Şifreler eşleşmiyor.",
                Errors = new List<string> { "Passwords do not match" }
            };
        }

        var user = await _userManager.FindByIdAsync(request.UserId.ToString());

        if (user == null)
        {
            return new AuthResponse
            {
                Success = false,
                Message = "Kullanıcı bulunamadı.",
                Errors = new List<string> { "User not found" }
            };
        }

        var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);

        if (!result.Succeeded)
        {
            return new AuthResponse
            {
                Success = false,
                Message = "Şifre sıfırlanamadı.",
                Errors = result.Errors.Select(e => e.Description).ToList()
            };
        }

        // A new password signs out every device
        await _db.UserRefreshTokens.Where(t => t.UserId == user.Id).ExecuteDeleteAsync(cancellationToken);

        return new AuthResponse
        {
            Success = true,
            Message = "Şifre başarıyla güncellendi."
        };
    }

    private UserDto ToUserDto(ApplicationUser user) => new()
    {
        Id = user.Id,
        Email = user.Email!,
        Name = user.Name,
        Surname = user.Surname,
        IsAdmin = AdminAccess.IsAdminEmail(_configuration, user.Email)
    };

    private string GenerateJwtToken(ApplicationUser user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim(ClaimTypes.Name, $"{user.Name} {user.Surname}"),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };
        // Admin role comes only from server config (Admin__Emails)
        if (AdminAccess.IsAdminEmail(_configuration, user.Email))
            claims.Add(new Claim(ClaimTypes.Role, AdminAccess.RoleName));

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <summary>Creates a refresh token for one device and stores only its hash.</summary>
    private async Task<string> IssueRefreshTokenAsync(Guid userId, CancellationToken ct)
    {
        var raw = GenerateRefreshToken();
        var now = DateTime.UtcNow;

        // Housekeeping: drop this user's expired tokens
        await _db.UserRefreshTokens.Where(t => t.UserId == userId && t.ExpiresAt <= now).ExecuteDeleteAsync(ct);

        _db.UserRefreshTokens.Add(new UserRefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TokenHash = HashToken(raw),
            CreatedAt = now,
            ExpiresAt = now.AddDays(_jwtSettings.RefreshTokenExpirationInDays),
        });
        await _db.SaveChangesAsync(ct);
        return raw;
    }

    private static string HashToken(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

    private static string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}

