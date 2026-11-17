using FitLog.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace FitLog.Infrastructure.Services;

/// <summary>
/// Development fallback when no email provider is configured: writes the email to the log
/// (so the password-reset link can be copied from the console) instead of sending it.
/// Never registered outside Development.
/// </summary>
public class LogOnlyEmailSender : IEmailSender
{
    private readonly ILogger<LogOnlyEmailSender> _logger;

    public LogOnlyEmailSender(ILogger<LogOnlyEmailSender> logger) => _logger = logger;

    public bool IsConfigured => true;

    public Task SendEmailAsync(string to, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        _logger.LogWarning("[DEV EMAIL - not sent] To: {To} | Subject: {Subject}\n{Body}", to, subject, htmlBody);
        return Task.CompletedTask;
    }
}
