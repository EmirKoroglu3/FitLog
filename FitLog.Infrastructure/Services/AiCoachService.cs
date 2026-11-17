using System.Text.Json;
using FitLog.Application.DTOs.AiCoach;
using FitLog.Infrastructure.Services.Coach;
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
        var now = DateTime.UtcNow;
        var since = now.AddDays(-56);

        // Real performed workouts (not program templates), meals and weigh-ins
        var sessions = await _context.WorkoutSessions.AsNoTracking()
            .Where(s => s.UserId == userId && s.StartedAt >= since)
            .Select(s => new CoachSession(
                s.StartedAt,
                s.Type == SessionType.Cardio,
                s.DurationSeconds,
                s.Sets.Select(x => new CoachSet(x.ExerciseName, x.Reps, x.WeightKg, x.Rpe, x.IsWarmup)).ToList()))
            .ToListAsync(cancellationToken);

        var meals = await _context.NutritionLogs.AsNoTracking()
            .Where(n => n.UserId == userId && n.Date >= now.AddDays(-28))
            .Select(n => new CoachMeal(n.Date, n.Calories, n.Protein))
            .ToListAsync(cancellationToken);

        // Supplements taken (whey, gainer...) count toward intake, but only on days that also have
        // meal logs: a shake alone shouldn't turn an unlogged day into a "logged" low-calorie day.
        var supplementSince = DateOnly.FromDateTime(now.AddDays(-28));
        var supplementIntakes = await (
                from i in _context.SupplementIntakes.AsNoTracking()
                join s in _context.Supplements.AsNoTracking() on i.SupplementId equals s.Id
                where i.UserId == userId && i.Date >= supplementSince && (s.Calories > 0 || s.Protein > 0)
                select new { i.Date, s.Calories, s.Protein })
            .ToListAsync(cancellationToken);
        var mealDays = meals.Select(m => DateOnly.FromDateTime(m.Date)).ToHashSet();
        meals.AddRange(supplementIntakes
            .Where(x => mealDays.Contains(x.Date))
            .Select(x => new CoachMeal(x.Date.ToDateTime(new TimeOnly(12, 0), DateTimeKind.Utc), x.Calories ?? 0, x.Protein ?? 0)));

        var weighIns = await _context.BodyMeasurements.AsNoTracking()
            .Where(m => m.UserId == userId && m.WeightKg != null && m.Date >= DateOnly.FromDateTime(now.AddDays(-60)))
            .Select(m => new CoachWeighIn(m.Date, m.WeightKg!.Value))
            .ToListAsync(cancellationToken);

        var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        var weight = request.Weight > 0 ? request.Weight : weighIns.OrderBy(w => w.Date).LastOrDefault()?.WeightKg ?? user?.Weight ?? 75;
        var height = request.Height > 0 ? request.Height : user?.Height ?? 175;
        int? age = user?.BirthDate is { } bd ? (int)((now - bd).TotalDays / 365.25) : null;
        var profile = new CoachProfile(height, weight, age, user?.Gender, request.Goal, Math.Max(1, request.WeeklyWorkoutFrequency));

        // New data → new analysis: include data volume in the cache key
        var cacheKey = $"AiCoach:{userId}:{height}:{weight}:{request.Goal}:{request.WeeklyWorkoutFrequency}:{sessions.Count}:{meals.Count}:{weighIns.Count}";
        if (_settings.CacheDurationMinutes > 0 && _cache.TryGetValue(cacheKey, out AiCoachAnalysisResponseDto? cached))
            return cached!;

        var (insights, targets, stats, summary) = CoachAnalyzer.Analyze(profile, sessions, meals, weighIns, now);
        var metrics = LegacyMetrics(sessions, meals, insights);
        var trainingSummary = string.Join("\n", insights.Where(i => i.Category is "training" or "recovery").Select(i => $"- {i.Title}: {i.Metric}"));
        var nutritionSummary = string.Join("\n", insights.Where(i => i.Category is "nutrition" or "body").Select(i => $"- {i.Title}: {i.Metric}"));

        var response = new AiCoachAnalysisResponseDto
        {
            Summary = summary,
            Insights = insights,
            Targets = targets,
            Stats = stats,
            Source = "rules",
            CalculatedMetrics = metrics,
            TrainingAdvice = string.Join(" ", insights.Where(i => i.Category is "training" or "recovery").Select(i => i.Action)),
            NutritionAdvice = string.Join(" ", insights.Where(i => i.Category == "nutrition").Select(i => i.Action)),
            BulkCutRecommendation = insights.FirstOrDefault(i => i.Category == "body")?.Action ?? string.Empty,
            MacroSuggestion = $"Günlük ~{targets.Calories} kcal: {targets.ProteinG} g protein, {targets.CarbsG} g karbonhidrat, {targets.FatG} g yağ.",
            PlateauWarning = string.Join(" ", insights.Where(i => i.Title.Contains("durmuş")).Select(i => i.Action)),
        };

        // Optional: a free-text commentary from OpenAI on top of the rule-based findings
        string aiResponse = string.Join("\n\n", insights.Select(i => $"{i.Title}\n{i.Metric}\n{i.Detail}\n→ {i.Action}"));
        if (!_settings.UseDemoMode)
        {
            try
            {
                var prompt = BuildPrompt(request, trainingSummary, nutritionSummary, metrics);
                aiResponse = await _openAiClient.GetCompletionAsync(prompt, cancellationToken);
                response.Source = "openai";
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "OpenAI çağrısı başarısız, kural tabanlı analiz kullanılıyor. UserId: {UserId}", userId);
            }
        }
        response.RawAiRecommendation = aiResponse;

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

    /// <summary>Keeps the older metrics block filled from real session data.</summary>
    private static AiCoachCalculatedMetricsDto LegacyMetrics(List<CoachSession> sessions, List<CoachMeal> meals, List<CoachInsightDto> insights)
    {
        var m = new AiCoachCalculatedMetricsDto();
        foreach (var g in sessions.SelectMany(s => s.Sets).Where(x => !x.IsWarmup).GroupBy(x => x.Exercise))
            m.WeeklyVolumePerExercise[g.Key] = Math.Round(g.Sum(x => x.WeightKg * x.Reps) / 8m, 0);
        var days = meals.Select(x => x.Date.Date).Distinct().Count();
        if (days > 0)
        {
            m.AverageWeeklyCalories = meals.Sum(x => x.Calories) / (decimal)days * 7;
            m.AverageWeeklyProtein = meals.Sum(x => x.Protein) / days * 7;
        }
        m.ProgressiveOverloadDetected = insights.Any(i => i.Title.Contains("güçleniyorsun"));
        m.PlateauExercises = insights.Where(i => i.Title.Contains("durmuş")).Select(i => i.Title.Split(':')[0]).ToList();
        m.PlateauDetected = m.PlateauExercises.Count > 0;
        return m;
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
