using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using FitLog.Application.DTOs.Auth;
using FitLog.Application.Interfaces;
using FitLog.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
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

    public AuthService(UserManager<ApplicationUser> userManager, IOptions<JwtSettings> jwtSettings)
    {
        _userManager = userManager;
        _jwtSettings = jwtSettings.Value;
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

