using FitLog.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace FitLog.API.Controllers;

/// <summary>
/// Test endpoint'leri (geliştirme/test amaçlı).
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    private readonly IEmailSender _emailSender;
    private readonly IConfiguration _configuration;
    private readonly ILogger<TestController> _logger;

    public TestController(
        IEmailSender emailSender,
        IConfiguration configuration,
        ILogger<TestController> logger)
    {
        _emailSender = emailSender;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Test email gönderimi.
    /// Test email adresi: appsettings.json içindeki "TestEmail" veya query parametresi ile belirtilebilir.
    /// </summary>
    [HttpGet("mail")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> SendTestEmail([FromQuery] string? to = null, CancellationToken cancellationToken = default)
    {
        // Test email adresini belirle: query parametresi > config > varsayılan
        var testEmail = to ?? _configuration["TestEmail"] ?? "test@example.com";

        if (string.IsNullOrWhiteSpace(testEmail) || !testEmail.Contains('@'))
        {
            return BadRequest(new
            {
                success = false,
                message = "Geçerli bir email adresi belirtmelisiniz. Query parametresi olarak 'to' kullanabilirsiniz veya appsettings.json içine 'TestEmail' ekleyebilirsiniz."
            });
        }

        try
        {
            var subject = "FitLog - Test Email";
            var htmlContent = @"
                <h2>Test Email</h2>
                <p>Bu bir test email'idir.</p>
                <p>SendGrid entegrasyonu başarıyla çalışıyor! ✅</p>
                <p><strong>Gönderim Zamanı:</strong> " + DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss UTC") + @"</p>
            ";

            await _emailSender.SendEmailAsync(testEmail, subject, htmlContent, cancellationToken);

            _logger.LogInformation("Test email başarıyla gönderildi. Alıcı: {Email}", testEmail);

            return Ok(new
            {
                success = true,
                message = $"Test email başarıyla gönderildi: {testEmail}",
                sentTo = testEmail,
                timestamp = DateTime.UtcNow
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogError(ex, "Test email gönderimi başarısız. Alıcı: {Email}", testEmail);
            return StatusCode(500, new
            {
                success = false,
                message = "Email gönderilemedi. SendGrid API Key yapılandırmasını kontrol edin.",
                error = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Test email gönderimi sırasında beklenmeyen bir hata oluştu. Alıcı: {Email}", testEmail);
            return StatusCode(500, new
            {
                success = false,
                message = "Email gönderimi sırasında bir hata oluştu.",
                error = ex.Message
            });
        }
    }
}
