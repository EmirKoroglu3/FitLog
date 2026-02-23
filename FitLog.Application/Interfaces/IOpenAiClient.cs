namespace FitLog.Application.Interfaces;

/// <summary>
/// OpenAI API istemcisi arayüzü.
/// Yapılandırma: OpenAI:ApiKey, OpenAI:Model (örn. gpt-4o-mini), OpenAI:BaseUrl
/// </summary>
public interface IOpenAiClient
{
    /// <summary>
    /// Verilen prompt için tamamlama (completion) döner.
    /// </summary>
    Task<string> GetCompletionAsync(string prompt, CancellationToken cancellationToken = default);
}
