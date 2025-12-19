using FitLog.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace FitLog.Infrastructure.Services;

/// <summary>
/// SendGrid tabanlı email gönderici servisi.
/// API Key: Environment variable veya User Secrets'tan alınmalıdır.
/// Örnek: dotnet user-secrets set "SendGrid:ApiKey" "YOUR_API_KEY"
/// </summary>
public class SendGridEmailService : IEmailSender
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SendGridEmailService> _logger;

    public SendGridEmailService(IConfiguration configuration, ILogger<SendGridEmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailAsync(string to, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        var apiKey = _configuration["SendGrid:ApiKey"];
        var fromEmail = _configuration["SendGrid:FromEmail"] ?? "fitlog.noreply@gmail.com";
        var fromName = _configuration["SendGrid:FromName"] ?? "FitLog";

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogError("SendGrid API Key bulunamadı. Lütfen environment variable veya user secrets ile 'SendGrid:ApiKey' değerini ayarlayın.");
            throw new InvalidOperationException("SendGrid API Key yapılandırılmamış. Lütfen 'SendGrid:ApiKey' değerini ayarlayın.");
        }

        var client = new SendGridClient(apiKey);
        var from = new EmailAddress(fromEmail, fromName);
        var toAddress = new EmailAddress(to);
        var message = MailHelper.CreateSingleEmail(from, toAddress, subject, null, htmlBody);

        try
        {
            var response = await client.SendEmailAsync(message, cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Email başarıyla gönderildi. Alıcı: {To}, Konu: {Subject}", to, subject);
            }
            else
            {
                var responseBody = await response.Body.ReadAsStringAsync(cancellationToken);
                _logger.LogError(
                    "SendGrid email gönderimi başarısız. StatusCode: {StatusCode}, Alıcı: {To}, Konu: {Subject}, Hata: {Error}",
                    response.StatusCode,
                    to,
                    subject,
                    responseBody
                );
                throw new InvalidOperationException($"Email gönderilemedi. StatusCode: {response.StatusCode}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Email gönderimi sırasında beklenmeyen bir hata oluştu. Alıcı: {To}, Konu: {Subject}", to, subject);
            throw;
        }
    }
}
