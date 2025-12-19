using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using FitLog.Application.DTOs.Auth;
using FitLog.Application.Interfaces;
using FitLog.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
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

    public AuthService(
        UserManager<ApplicationUser> userManager,
        IOptions<JwtSettings> jwtSettings,
        IEmailSender emailSender,
        IConfiguration configuration)
    {
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
        var refreshToken = GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationInDays);
        await _userManager.UpdateAsync(user);

        return new AuthResponse
        {
            Success = true,
            Message = "Kayıt başarılı.",
            Token = token,
            RefreshToken = refreshToken,
            TokenExpiration = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes),
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email!,
                Name = user.Name,
                Surname = user.Surname
            }
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

        var token = GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationInDays);
        await _userManager.UpdateAsync(user);

        return new AuthResponse
        {
            Success = true,
            Message = "Giriş başarılı.",
            Token = token,
            RefreshToken = refreshToken,
            TokenExpiration = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes),
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email!,
                Name = user.Name,
                Surname = user.Surname
            }
        };
    }

    public async Task<AuthResponse?> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        var users = _userManager.Users.Where(u => u.RefreshToken == refreshToken).ToList();
        var user = users.FirstOrDefault();

        if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            return null;
        }

        var newToken = GenerateJwtToken(user);
        var newRefreshToken = GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationInDays);
        await _userManager.UpdateAsync(user);

        return new AuthResponse
        {
            Success = true,
            Message = "Token yenilendi.",
            Token = newToken,
            RefreshToken = newRefreshToken,
            TokenExpiration = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes),
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email!,
                Name = user.Name,
                Surname = user.Surname
            }
        };
    }

    public async Task<AuthResponse> ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);

        // Kullanıcıyı bulamasak bile, hesap var/yok bilgisini sızdırmamak için her zaman aynı cevabı döneriz.
        if (user == null)
        {
            return new AuthResponse
            {
                Success = true,
                Message = "Eğer bu email ile kayıtlı bir hesabın varsa, şifre sıfırlama bağlantısı gönderildi."
            };
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);

        // Şifre sıfırlama linkini oluştur
        var encodedToken = Uri.EscapeDataString(token);
        
        // Frontend URL'i önce environment variable'dan al (production için),
        // yoksa appsettings.json'dan al, yoksa varsayılan olarak localhost kullan
        // Production'da: FrontendUrl environment variable olarak ayarla
        // Örnek: set FrontendUrl=https://fitlog.com (Windows) veya export FrontendUrl=https://fitlog.com (Linux/Mac)
        var frontendUrl = Environment.GetEnvironmentVariable("FrontendUrl") 
            ?? _configuration["FrontendUrl"] 
            ?? "http://localhost:5173";
        
        var resetLink = $"{frontendUrl}/reset-password?userId={user.Id}&token={encodedToken}";

        var subject = "FitLog - Şifre Sıfırlama";
        var body = $@"
            <p>Merhaba {user.Name},</p>
            <p>Şifreni sıfırlamak için aşağıdaki bağlantıya tıklayabilirsin:</p>
            <p><a href=""{resetLink}"">Şifremi Sıfırla</a></p>
            <p>Eğer bu isteği sen yapmadıysan bu e-postayı dikkate alma.</p>
        ";

        await _emailSender.SendEmailAsync(user.Email!, subject, body, cancellationToken);

        return new AuthResponse
        {
            Success = true,
            Message = "Eğer bu email ile kayıtlı bir hesabın varsa, şifre sıfırlama bağlantısı gönderildi."
        };
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

        return new AuthResponse
        {
            Success = true,
            Message = "Şifre başarıyla güncellendi."
        };
    }

    private string GenerateJwtToken(ApplicationUser user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim(ClaimTypes.Name, $"{user.Name} {user.Surname}"),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}

