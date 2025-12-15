using FitLog.Application.DTOs.Auth;

namespace FitLog.Application.Interfaces;

/// <summary>
/// Authentication service interface.
/// Kullanıcı kayıt ve giriş işlemlerini yönetir.
/// </summary>
public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponse?> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default);
}

