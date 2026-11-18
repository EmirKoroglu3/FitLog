using Microsoft.Extensions.Configuration;

namespace FitLog.Infrastructure.Identity;

/// <summary>
/// Who is an admin. Comes only from server config (env var Admin__Emails, comma or semicolon separated),
/// never from the app itself, so nobody can make themselves admin through the UI or API.
/// </summary>
public static class AdminAccess
{
    public const string RoleName = "Admin";

    public static bool IsAdminEmail(IConfiguration configuration, string? email)
    {
        if (string.IsNullOrWhiteSpace(email)) return false;
        var list = configuration["Admin:Emails"];
        if (string.IsNullOrWhiteSpace(list)) return false;

        return list
            .Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Any(e => string.Equals(e, email.Trim(), StringComparison.OrdinalIgnoreCase));
    }
}
