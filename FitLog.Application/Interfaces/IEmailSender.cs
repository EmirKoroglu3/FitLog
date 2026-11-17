namespace FitLog.Application.Interfaces;

/// <summary>
/// Basit email gönderim servisi arayüzü.
/// </summary>
public interface IEmailSender
{
    /// <summary>False when no email provider is set up, so callers can tell the user instead of failing silently.</summary>
    bool IsConfigured { get; }

    Task SendEmailAsync(string to, string subject, string htmlBody, CancellationToken cancellationToken = default);
}
