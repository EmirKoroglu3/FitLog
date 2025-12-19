using System.Net;
using System.Net.Mail;
using System.Text;
using FitLog.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace FitLog.Infrastructure.Services;

/// <summary>
/// Basit SMTP tabanlı email gönderici.
/// </summary>
public class SmtpEmailSender : IEmailSender
{
    private readonly IConfiguration _configuration;

    public SmtpEmailSender(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string to, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        var smtpSection = _configuration.GetSection("Smtp");
        var host = smtpSection["Host"];
        var port = int.Parse(smtpSection["Port"] ?? "587");
        var enableSsl = bool.Parse(smtpSection["EnableSsl"] ?? "true");
        var user = smtpSection["User"];
        var password = smtpSection["Password"];
        var from = smtpSection["From"] ?? user;

        using var client = new SmtpClient(host, port)
        {
            EnableSsl = enableSsl,
            Credentials = new NetworkCredential(user, password)
        };

        using var message = new MailMessage
        {
            From = new MailAddress(from!),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true,
            BodyEncoding = Encoding.UTF8,
            SubjectEncoding = Encoding.UTF8
        };

        message.To.Add(to);

        await client.SendMailAsync(message, cancellationToken);
    }
}

