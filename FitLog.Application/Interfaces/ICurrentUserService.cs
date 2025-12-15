namespace FitLog.Application.Interfaces;

/// <summary>
/// Mevcut kullanıcı bilgilerine erişim interface'i.
/// HTTP context'ten kullanıcı bilgilerini alır.
/// </summary>
public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Email { get; }
    bool IsAuthenticated { get; }
}

