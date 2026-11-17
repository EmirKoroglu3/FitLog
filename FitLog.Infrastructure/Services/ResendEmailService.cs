using System.Net.Http.Headers;
using System.Net.Http.Json;
using FitLog.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace FitLog.Infrastructure.Services;

/// <summary>
/// Sends email through the Resend HTTP API (https://resend.com).
/// HTTP is used instead of SMTP because Render's free instances block outbound SMTP ports.
/// Config: Resend:ApiKey (secret), Resend:FromEmail (an address on a domain verified in Resend), Resend:FromName.
/// </summary>
public class ResendEmailService : IEmailSender
{
    private readonly HttpClient _http;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ResendEmailService> _logger;

    public ResendEmailService(HttpClient http, IConfiguration configuration, ILogger<ResendEmailService> logger)
    {
        _http = http;
        _configuration = configuration;
        _logger = logger;
    }

    public bool IsConfigured => !string.IsNullOrWhiteSpace(_configuration["Resend:ApiKey"]);

    public async Task SendEmailAsync(string to, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        var apiKey = _configuration["Resend:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
            throw new InvalidOperationException("Resend:ApiKey is not configured.");

        var fromEmail = _configuration["Resend:FromEmail"] ?? "noreply@emirkoroglu.online";
        var fromName = _configuration["Resend:FromName"] ?? "FitLog";

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails")
        {
            Content = JsonContent.Create(new
            {
                from = $"{fromName} <{fromEmail}>",
                to = new[] { to },
                subject,
                html = htmlBody,
            }),
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        using var response = await _http.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError("Resend email failed. Status: {Status}, Subject: {Subject}, Error: {Error}", response.StatusCode, subject, body);
            throw new InvalidOperationException($"Email could not be sent (status {(int)response.StatusCode}).");
        }

        _logger.LogInformation("Email sent via Resend. Subject: {Subject}", subject);
    }
}
