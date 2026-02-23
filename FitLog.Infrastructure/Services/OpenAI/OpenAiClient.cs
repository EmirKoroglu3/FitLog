using System.Net.Http.Json;
using System.Text.Json;
using FitLog.Application.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FitLog.Infrastructure.Services.OpenAI;

/// <summary>
/// OpenAI Chat Completions API istemcisi.
/// </summary>
public class OpenAiClient : IOpenAiClient
{
    private readonly HttpClient _httpClient;
    private readonly OpenAiSettings _settings;
    private readonly ILogger<OpenAiClient> _logger;

    public OpenAiClient(HttpClient httpClient, IOptions<OpenAiSettings> settings, ILogger<OpenAiClient> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<string> GetCompletionAsync(string prompt, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_settings.ApiKey))
        {
            _logger.LogError("OpenAI ApiKey yapılandırılmamış.");
            throw new InvalidOperationException("OpenAI ApiKey yapılandırılmamış. Lütfen OpenAI:ApiKey değerini ayarlayın.");
        }

        _httpClient.DefaultRequestHeaders.Remove("Authorization");
        _httpClient.DefaultRequestHeaders.Add("Authorization", "Bearer " + _settings.ApiKey);

        var requestBody = new
        {
            model = _settings.Model,
            messages = new[]
            {
                new { role = "user", content = prompt }
            },
            max_tokens = 1500
        };

        try
        {
            var response = await _httpClient.PostAsJsonAsync(_settings.BaseUrl, requestBody, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError("OpenAI API hatası. StatusCode: {StatusCode}, Body: {Body}", response.StatusCode, errorBody);
                throw new InvalidOperationException($"OpenAI API hatası: {response.StatusCode}");
            }

            var json = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken);
            var content = json.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();
            return content ?? string.Empty;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "OpenAI completion sırasında hata oluştu.");
            throw;
        }
    }
}
