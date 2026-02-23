using System.Text.Json;
using FitLog.Application.DTOs.AiCoach;
using FitLog.Application.Interfaces;
using FitLog.Application.Services;
using FitLog.Domain.Entities;
using FitLog.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FitLog.Infrastructure.Services;

/// <summary>
/// AI Coach servisi. Son 30 gün antrenman ve beslenme verisini analiz edip OpenAI ile öneri üretir.
/// </summary>
public class AiCoachService : IAiCoachService
{
    private readonly FitLogDbContext _context;
    private readonly IOpenAiClient _openAiClient;
    private readonly IMemoryCache _cache;
    private readonly ILogger<AiCoachService> _logger;
    private readonly AiCoachSettings _settings;

    public AiCoachService(
        FitLogDbContext context,
        IOpenAiClient openAiClient,
        IMemoryCache cache,
        ILogger<AiCoachService> logger,
        IOptions<AiCoachSettings> settings)
    {
        _context = context;
        _openAiClient = openAiClient;
        _cache = cache;
        _logger = logger;
        _settings = settings.Value;
    }

    public async Task<AiCoachAnalysisResponseDto> AnalyzeAsync(
        Guid userId,
        AiCoachAnalysisRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var cacheKey = $"AiCoach:{userId}:{request.Height}:{request.Weight}:{request.Goal}:{request.WeeklyWorkoutFrequency}";
        if (_settings.CacheDurationMinutes > 0 && _cache.TryGetValue(cacheKey, out AiCoachAnalysisResponseDto? cached))
        {
            _logger.LogInformation("AI Coach analizi cache'den döndü. UserId: {UserId}", userId);
            return cached!;
        }

        var since = DateTime.UtcNow.AddDays(-30);

        var exercises = await _context.Exercises
            .Include(e => e.WorkoutDay)
            .ThenInclude(wd => wd.WorkoutProgram)
            .Where(e => e.WorkoutDay.WorkoutProgram.UserId == userId && e.CreatedDate >= since)
            .ToListAsync(cancellationToken);

        var exerciseLogs = exercises.Select(e => new ExerciseLogRow(e.Name, e.SetCount, e.Reps, e.Weight, e.CreatedDate)).ToList();

        var nutritionLogs = await _context.NutritionLogs
            .Where(n => n.UserId == userId && n.Date >= since.Date)
            .ToListAsync(cancellationToken);

        var metrics = CalculateMetrics(exerciseLogs, nutritionLogs, since);
        var trainingSummary = BuildTrainingSummary(metrics);
        var nutritionSummary = BuildNutritionSummary(metrics);

        var prompt = BuildPrompt(request, trainingSummary, nutritionSummary, metrics);
        string aiResponse = string.Empty;
        AiCoachAnalysisResponseDto response;

        if (_settings.UseDemoMode)
        {
            _logger.LogInformation("AI Coach demo modu aktif. OpenAI çağrısı yapılmayacak. UserId: {UserId}", userId);
            response = BuildDemoResponse(request, trainingSummary, nutritionSummary, metrics);
            aiResponse = response.RawAiRecommendation ?? string.Empty;
        }
        else
        {
            try
            {
                aiResponse = await _openAiClient.GetCompletionAsync(prompt, cancellationToken);
                response = ParseAiResponse(aiResponse, metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "OpenAI çağrısı başarısız. Demo moda düşülüyor. UserId: {UserId}", userId);
                response = BuildDemoResponse(request, trainingSummary, nutritionSummary, metrics);
                aiResponse = response.RawAiRecommendation ?? aiResponse ?? string.Empty;
            }
        }

        var report = new AiCoachReport
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            AnalysisDate = DateTime.UtcNow,
            TrainingSummary = trainingSummary,
            NutritionSummary = nutritionSummary,
            AiRecommendationText = aiResponse,
            CalculatedVolumeJson = JsonSerializer.Serialize(metrics),
            CreatedDate = DateTime.UtcNow
        };

        _context.Set<AiCoachReport>().Add(report);
        await _context.SaveChangesAsync(cancellationToken);

        if (_settings.CacheDurationMinutes > 0)
            _cache.Set(cacheKey, response, TimeSpan.FromMinutes(_settings.CacheDurationMinutes));

        return response;
    }

    private static AiCoachCalculatedMetricsDto CalculateMetrics(
        List<ExerciseLogRow> exerciseLogs,
        List<NutritionLog> nutritionLogs,
        DateTime since)
    {
        var metrics = new AiCoachCalculatedMetricsDto();

        var weekVolumes = new Dictionary<string, List<decimal>>();
        foreach (var e in exerciseLogs)
        {
            int week = (int)((e.CreatedDate - since).TotalDays / 7);
            decimal weight = e.Weight ?? 0;
            decimal volume = weight * e.SetCount * e.Reps;

            if (!weekVolumes.ContainsKey(e.Name))
                weekVolumes[e.Name] = new List<decimal>();
            while (weekVolumes[e.Name].Count <= week)
                weekVolumes[e.Name].Add(0);
            weekVolumes[e.Name][week] += volume;
        }

        foreach (var kv in weekVolumes)
        {
            metrics.WeeklyVolumePerExercise[kv.Key] = kv.Value.Count > 0 ? kv.Value.Average() : 0;
        }

        bool progressiveOverload = false;
        var plateauExercises = new List<string>();
        foreach (var kv in weekVolumes)
        {
            var vols = kv.Value;
            if (vols.Count >= 2 && vols[vols.Count - 1] > vols[vols.Count - 2])
                progressiveOverload = true;
            if (vols.Count >= 3 && vols[vols.Count - 1] <= vols[vols.Count - 2] && vols[vols.Count - 2] <= vols[vols.Count - 3])
                plateauExercises.Add(kv.Key);
        }

        metrics.ProgressiveOverloadDetected = progressiveOverload;
        metrics.PlateauDetected = plateauExercises.Count > 0;
        metrics.PlateauExercises = plateauExercises;

        if (nutritionLogs.Count > 0)
        {
            var totalCalories = nutritionLogs.Sum(n => n.Calories);
            var totalProtein = nutritionLogs.Sum(n => n.Protein);
            var totalCarbs = nutritionLogs.Sum(n => n.Carbohydrates ?? 0);
            var totalFat = nutritionLogs.Sum(n => n.Fat ?? 0);
            int days = nutritionLogs.Select(n => n.Date.Date).Distinct().Count();
            if (days > 0)
            {
                metrics.AverageWeeklyCalories = (decimal)(totalCalories / (double)days) * 7;
                metrics.AverageWeeklyProtein = (decimal)((double)totalProtein / days) * 7;
                if (totalCalories > 0)
                {
                    metrics.ProteinPercent = (decimal)((double)totalProtein * 4 / totalCalories * 100);
                    metrics.CarbsPercent = (decimal)((double)totalCarbs * 4 / totalCalories * 100);
                    metrics.FatPercent = (decimal)((double)totalFat * 9 / totalCalories * 100);
                }
            }
        }

        return metrics;
    }

    private static string BuildTrainingSummary(AiCoachCalculatedMetricsDto m)
    {
        var lines = m.WeeklyVolumePerExercise
            .Select(kv => $"- {kv.Key}: haftalık ortalama volume = {kv.Value:F0} kg")
            .ToList();
        var summary = string.Join("\n", lines);
        if (string.IsNullOrEmpty(summary)) summary = "Son 30 günde antrenman kaydı yok.";
        summary += $"\nProgressive overload: {(m.ProgressiveOverloadDetected ? "Evet" : "Hayır")}";
        summary += $"\nPlateau tespiti: {(m.PlateauDetected ? "Evet (" + string.Join(", ", m.PlateauExercises) + ")" : "Hayır")}";
        return summary;
    }

    private static string BuildNutritionSummary(AiCoachCalculatedMetricsDto m)
    {
        return $"Ortalama haftalık kalori: {m.AverageWeeklyCalories:F0}\n" +
               $"Ortalama haftalık protein: {m.AverageWeeklyProtein:F0} g\n" +
               $"Makro dağılımı (P/C/Y): %{m.ProteinPercent:F0} / %{m.CarbsPercent:F0} / %{m.FatPercent:F0}";
    }

    private static AiCoachAnalysisResponseDto BuildDemoResponse(
        AiCoachAnalysisRequestDto req,
        string trainingSummary,
        string nutritionSummary,
        AiCoachCalculatedMetricsDto metrics)
    {
        var goalLabel = req.Goal switch
        {
            GoalType.Bulk => "kas ve kilo kazanımı (bulk)",
            GoalType.Cut => "yağ kaybı (cut)",
            _ => "kiloyu koruma (maintain)"
        };

        var trainingAdvice =
            $"Hedefin {goalLabel}. Haftalık {req.WeeklyWorkoutFrequency} antrenman sıklığı bu hedef için gayet uygun. " +
            (metrics.ProgressiveOverloadDetected
                ? "Set hacmin haftalar içinde artmış görünüyor, progressive overload uyguluyorsun, bu çok iyi. "
                : "Set hacmin haftalar içinde çok değişmiyor, ağırlık veya tekrar ekleyerek progressive overload uygulamaya çalış. ") +
            (metrics.PlateauDetected && metrics.PlateauExercises.Count > 0
                ? $"Özellikle {string.Join(", ", metrics.PlateauExercises)} hareketlerinde plateau belirtileri var; farklı tekrar aralıkları, varyasyonlar veya deload haftası eklemeyi düşünebilirsin."
                : "Her hareket için belli aralıklarla deload haftası ve varyasyon eklemek performansını uzun vadede korumana yardımcı olur.");

        var calories = metrics.AverageWeeklyCalories > 0 ? metrics.AverageWeeklyCalories / 7m : 0;
        var protein = metrics.AverageWeeklyProtein > 0 ? metrics.AverageWeeklyProtein / 7m : 0;
        var nutritionAdvice =
            $"Günlük ortalama kalorinin yaklaşık {calories:F0} kcal civarında, günlük ortalama protein alımın ise {protein:F0} g seviyesinde. " +
            "Hedefine göre protein alımını vücut ağırlığının kg başına 1.6–2.2 g bandında tutmaya çalış. " +
            "Karbonhidratları antrenman günlerinde biraz daha yüksek, dinlenme günlerinde daha düşük tutmak performansını destekler.";

        string bulkCutRecommendation;
        if (req.Goal == GoalType.Cut)
        {
            bulkCutRecommendation =
                "Şu anda önceliğin yağ kaybı. Ağırlığın haftada yaklaşık %0.5–0.75 oranında azalacak şekilde hafif bir kalori açığı hedefle.";
        }
        else if (req.Goal == GoalType.Bulk)
        {
            bulkCutRecommendation =
                "Kas kazanımı için çok agresif olmayan, hafif bir kalori fazlası (yaklaşık bakım kalorinin %5–10 üzeri) uygun olacaktır.";
        }
        else
        {
            bulkCutRecommendation =
                "Kiloyu korurken performansını artırmak için bakım kalori civarında kal, küçük artış/azalışları performansına göre ayarla.";
        }

        var macroSuggestion =
            "Genel bir başlangıç noktası olarak; proteini toplam kalorinin %25–30'u, karbonhidratı %40–50'si, yağları ise %20–25'i olacak şekilde ayarlayabilirsin. " +
            "Antrenman öncesi/sonrası öğünlerinde karbonhidrat ve proteini biraz daha öne çekmek toparlanmana yardımcı olur.";

        var plateauWarning = metrics.PlateauDetected
            ? $"Bazı hareketlerde hacim artışı sınırlı görünüyor. Özellikle {string.Join(", ", metrics.PlateauExercises)} için set/tekrar şemasını, tempo ve dinlenme sürelerini güncellemeyi düşünebilirsin."
            : "Belirgin bir plateau sinyali yok, ancak her 6–8 haftada bir antrenman yapını küçük dokunuşlarla güncellemek faydalı olacaktır.";

        var raw =
            "DEMO YANIT (OpenAI devre dışı):\n\n" +
            $"1) Training advice\n{trainingAdvice}\n\n" +
            $"2) Nutrition advice\n{nutritionAdvice}\n\n" +
            $"3) Bulk/Cut confirmation\n{bulkCutRecommendation}\n\n" +
            $"4) Macro distribution suggestion\n{macroSuggestion}\n\n" +
            $"5) Plateau warning (if applicable)\n{plateauWarning}";

        return new AiCoachAnalysisResponseDto
        {
            TrainingAdvice = trainingAdvice,
            NutritionAdvice = nutritionAdvice,
            BulkCutRecommendation = bulkCutRecommendation,
            MacroSuggestion = macroSuggestion,
            PlateauWarning = plateauWarning,
            RawAiRecommendation = raw,
            CalculatedMetrics = metrics
        };
    }

    private static string BuildPrompt(
        AiCoachAnalysisRequestDto req,
        string trainingSummary,
        string nutritionSummary,
        AiCoachCalculatedMetricsDto m)
    {
        var goalStr = req.Goal switch { GoalType.Bulk => "Bulk", GoalType.Cut => "Cut", _ => "Maintain" };
        return $@"You are a professional fitness coach. Analyze the following athlete data and respond in the same language as the input (Turkish if data is in Turkish).

Height: {req.Height} cm
Weight: {req.Weight} kg
Body Fat: {req.BodyFatPercentage}%
Goal: {goalStr}
Weekly workout frequency: {req.WeeklyWorkoutFrequency}

Workout Summary:
{trainingSummary}

Nutrition Summary:
{nutritionSummary}

Provide a concise but professional response with these sections (use exact headers):
1) Training advice
2) Nutrition advice
3) Bulk/Cut confirmation
4) Macro distribution suggestion
5) Plateau warning (if applicable)

Keep it concise but actionable.";
    }

    private static AiCoachAnalysisResponseDto ParseAiResponse(string aiResponse, AiCoachCalculatedMetricsDto metrics)
    {
        var dto = new AiCoachAnalysisResponseDto
        {
            RawAiRecommendation = aiResponse,
            CalculatedMetrics = metrics
        };

        var sections = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        var current = new List<string>();
        var currentKey = "";
        foreach (var line in aiResponse.Split('\n'))
        {
            if (line.StartsWith("1)") || line.StartsWith("2)") || line.StartsWith("3)") || line.StartsWith("4)") || line.StartsWith("5)"))
            {
                if (currentKey != null) sections[currentKey] = string.Join(" ", current).Trim();
                currentKey = line.Substring(0, 2).TrimEnd(')');
                current.Clear();
                current.Add(line.Length > 3 ? line.Substring(3).Trim() : "");
            }
            else if (currentKey != null && !string.IsNullOrWhiteSpace(line))
                current.Add(line.Trim());
        }
        if (currentKey != null) sections[currentKey] = string.Join(" ", current).Trim();

        if (sections.TryGetValue("1", out var t)) dto.TrainingAdvice = t;
        if (sections.TryGetValue("2", out var n)) dto.NutritionAdvice = n;
        if (sections.TryGetValue("3", out var b)) dto.BulkCutRecommendation = b;
        if (sections.TryGetValue("4", out var mac)) dto.MacroSuggestion = mac;
        if (sections.TryGetValue("5", out var p)) dto.PlateauWarning = p;

        return dto;
    }
}

/// <summary>
/// Hesaplama için egzersiz log satırı (EF anonymous type yerine).
/// </summary>
internal record ExerciseLogRow(string Name, int SetCount, int Reps, decimal? Weight, DateTime CreatedDate);

/// <summary>
/// AI Coach yapılandırması.
/// </summary>
public class AiCoachSettings
{
    public const string SectionName = "AiCoach";
    public int CacheDurationMinutes { get; set; } = 60;
    public bool UseDemoMode { get; set; } = false;
}
