namespace FitLog.Application.Interfaces;

/// <summary>
/// Basit email gönderim servisi arayüzü.
/// </summary>
public interface IEmailSender
{
    Task SendEmailAsync(string to, string subject, string htmlBody, CancellationToken cancellationToken = default);
}

