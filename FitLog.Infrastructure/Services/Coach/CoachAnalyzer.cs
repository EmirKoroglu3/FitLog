using System.Globalization;
using FitLog.Application.DTOs.AiCoach;

namespace FitLog.Infrastructure.Services.Coach;

// Inputs are plain records so the analyzer is a pure function (easy to test, no EF).
public record CoachSet(string Exercise, int Reps, decimal WeightKg, decimal? Rpe, bool IsWarmup);
public record CoachSession(DateTime StartedAt, bool IsCardio, int DurationSeconds, IReadOnlyList<CoachSet> Sets);
public record CoachMeal(DateTime Date, int Calories, decimal Protein);
public record CoachWeighIn(DateOnly Date, decimal WeightKg);
public record CoachProfile(decimal HeightCm, decimal WeightKg, int? Age, string? Gender, GoalType Goal, int PlannedSessionsPerWeek);

/// <summary>
/// Rule-based coach: turns the user's actual sessions, meals and weigh-ins into
/// specific findings with the numbers behind them and a concrete next step.
/// </summary>
public static class CoachAnalyzer
{
    private static readonly CultureInfo Tr = CultureInfo.GetCultureInfo("tr-TR");

    // Simple name → muscle group mapping for weekly set volume
    private static readonly (string Group, string[] Keys)[] MuscleGroups =
    {
        ("Göğüs", new[] { "bench", "chest", "fly", "crossover", "dip (göğüs)", "şınav", "push-up" }),
        ("Sırt", new[] { "row", "pulldown", "barfiks", "pull-up", "chin", "deadlift", "t-bar", "shrug" }),
        ("Omuz", new[] { "overhead", "shoulder", "lateral", "arnold", "front raise", "rear delt", "face pull", "upright" }),
        ("Bacak (ön)", new[] { "squat", "leg press", "leg extension", "lunge", "split squat", "step up", "hack" }),
        ("Bacak (arka) & Kalça", new[] { "romanian", "rdl", "leg curl", "hip thrust", "glute", "good morning", "kickback", "abduction", "frog pump" }),
        ("Kol", new[] { "curl", "tricep", "pushdown", "skull", "kickback", "extension" }),
    };

    public static (List<CoachInsightDto> Insights, CoachTargetsDto Targets, CoachStatsDto Stats, string Summary) Analyze(
        CoachProfile p, IReadOnlyList<CoachSession> sessions, IReadOnlyList<CoachMeal> meals, IReadOnlyList<CoachWeighIn> weighIns, DateTime nowUtc)
    {
        var insights = new List<CoachInsightDto>();
        var targets = Targets(p);
        var stats = new CoachStatsDto { BodyWeightKg = p.WeightKg };

        Consistency(p, sessions, nowUtc, stats, insights);
        LiftProgress(sessions, insights);
        WeeklyVolume(sessions, nowUtc, insights);
        Effort(sessions, nowUtc, insights);
        Nutrition(p, meals, nowUtc, targets, stats, insights);
        BodyTrend(p, weighIns, targets, stats, insights);

        // Most important first: warnings, then info, then good news
        var order = new Dictionary<string, int> { ["warning"] = 0, ["info"] = 1, ["good"] = 2 };
        insights = insights.OrderBy(i => order[i.Severity]).ToList();

        var warnings = insights.Count(i => i.Severity == "warning");
        var goods = insights.Count(i => i.Severity == "good");
        var summary = sessions.Count == 0 && meals.Count == 0
            ? "Henüz analiz edecek kadar veri yok. Antrenman modunda setlerini ve öğünlerini kaydettikçe öneriler kişiselleşir."
            : warnings == 0
                ? $"Genel tablo iyi görünüyor: {goods} olumlu bulgu var. Aşağıdaki önerilerle ilerlemeyi sürdürebilirsin."
                : $"{warnings} konuda dikkat etmen gereken bir durum var; en önemlisi en üstte. {goods} konuda ise doğru yoldasın.";

        return (insights, targets, stats, summary);
    }

    // ------------------------------------------------------------------

    /// <summary>Mifflin-St Jeor BMR × activity factor from planned frequency, adjusted for goal.</summary>
    public static CoachTargetsDto Targets(CoachProfile p)
    {
        var age = p.Age ?? 30;
        var female = string.Equals(p.Gender, "Kadın", StringComparison.OrdinalIgnoreCase);
        var bmr = 10 * (double)p.WeightKg + 6.25 * (double)p.HeightCm - 5 * age + (female ? -161 : 5);
        var activity = p.PlannedSessionsPerWeek switch { <= 1 => 1.2, <= 3 => 1.375, <= 5 => 1.55, _ => 1.725 };
        var tdee = bmr * activity;
        var calories = p.Goal switch { GoalType.Cut => tdee * 0.8, GoalType.Bulk => tdee * 1.1, _ => tdee };
        var proteinPerKg = p.Goal == GoalType.Cut ? 2.2 : p.Goal == GoalType.Bulk ? 1.8 : 1.6;
        var protein = proteinPerKg * (double)p.WeightKg;
        var fat = calories * 0.25 / 9;
        var carbs = Math.Max(0, (calories - protein * 4 - fat * 9) / 4);
        return new CoachTargetsDto
        {
            Bmr = (int)Math.Round(bmr),
            Tdee = (int)Math.Round(tdee),
            Calories = (int)Math.Round(calories / 10) * 10,
            ProteinG = (int)Math.Round(protein),
            FatG = (int)Math.Round(fat),
            CarbsG = (int)Math.Round(carbs),
        };
    }

    private static void Consistency(CoachProfile p, IReadOnlyList<CoachSession> sessions, DateTime now, CoachStatsDto stats, List<CoachInsightDto> insights)
    {
        var last4Weeks = sessions.Where(s => s.StartedAt >= now.AddDays(-28)).ToList();
        var perWeek = Math.Round(last4Weeks.Count / 4m, 1);
        stats.SessionsPerWeek = perWeek;

        if (sessions.Count == 0)
        {
            insights.Add(new CoachInsightDto
            {
                Category = "training", Severity = "info", Title = "Antrenman kaydı yok",
                Detail = "Son 8 haftada kayıtlı antrenman bulunamadı; bu yüzden güç gelişimini ve hacmi değerlendiremiyorum.",
                Action = "Bir sonraki antrenmanında Antrenman Modu'nu kullanıp her setin ağırlığını ve tekrarını kaydet.",
            });
            return;
        }

        var ratio = p.PlannedSessionsPerWeek > 0 ? perWeek / p.PlannedSessionsPerWeek : 1;
        if (ratio >= 0.9m)
            insights.Add(new CoachInsightDto
            {
                Category = "training", Severity = "good", Title = "Düzenli antrenman yapıyorsun",
                Metric = $"Son 4 hafta: haftada {perWeek.ToString(Tr)} antrenman (hedef {p.PlannedSessionsPerWeek})",
                Detail = "Gelişimin en büyük belirleyicisi süreklilik; planına sadık kalıyorsun.",
                Action = "Bu ritmi koru. Yorgunluk birikirse her 6–8 haftada bir hafif (deload) hafta ekle.",
            });
        else
            insights.Add(new CoachInsightDto
            {
                Category = "training", Severity = ratio < 0.6m ? "warning" : "info", Title = "Planladığından az antrenman yapıyorsun",
                Metric = $"Son 4 hafta: haftada {perWeek.ToString(Tr)} antrenman, hedef {p.PlannedSessionsPerWeek}",
                Detail = "Planlanan sıklığın altında kalınca her kas grubu haftada yeterince uyarılmıyor ve ilerleme yavaşlıyor.",
                Action = perWeek < 2
                    ? "Haftada en az 2–3 gün full body bir programa geç; daha az gün ama düzenli olmak, aksayan 5 günlük plandan iyidir."
                    : $"Hedefi gerçekçi tutmak için programı haftada {Math.Max(2, (int)Math.Round(perWeek, MidpointRounding.AwayFromZero))} güne indirmeyi ya da antrenman günlerini takvimde sabitlemeyi dene.",
            });
    }

    private static bool IsLowerBody(string exercise)
    {
        var n = exercise.ToLowerInvariant();
        return new[] { "squat", "deadlift", "leg press", "lunge", "hip thrust", "romanian", "rdl", "split squat", "good morning" }.Any(n.Contains);
    }

    private static decimal Epley(decimal w, int reps) => reps <= 1 ? w : w * (1 + reps / 30m);

    private static void LiftProgress(IReadOnlyList<CoachSession> sessions, List<CoachInsightDto> insights)
    {
        // Best estimated 1RM per exercise per session, oldest first
        var history = sessions.OrderBy(s => s.StartedAt)
            .SelectMany(s => s.Sets.Where(x => !x.IsWarmup && x.Reps > 0 && x.WeightKg > 0)
                .GroupBy(x => x.Exercise)
                .Select(g =>
                {
                    var best = g.OrderByDescending(x => Epley(x.WeightKg, x.Reps)).First();
                    return (Exercise: g.Key, Date: s.StartedAt, E1rm: Epley(best.WeightKg, best.Reps), BestKg: best.WeightKg, BestReps: best.Reps);
                }))
            .GroupBy(x => x.Exercise)
            .Where(g => g.Count() >= 3)
            .Select(g => g.ToList())
            .OrderByDescending(g => g.Count)
            .Take(6)
            .ToList();

        foreach (var h in history)
        {
            var name = h[0].Exercise;
            var first = h.Take(2).Max(x => x.E1rm);
            var recentBest = h.TakeLast(2).Max(x => x.E1rm);
            var weeks = Math.Max(1, (int)Math.Round((h[^1].Date - h[0].Date).TotalDays / 7));
            var changePct = first > 0 ? (recentBest - first) / first * 100 : 0;
            var metric = $"Tahmini 1RM {Fmt(first)} → {Fmt(recentBest)} kg ({weeks} hafta, {h.Count} antrenman)";
            var last = h[^1];
            var lower = IsLowerBody(name);
            var step = lower ? 5m : 2.5m;
            var lastSet = $"{Fmt(last.BestKg)} kg × {last.BestReps}";

            // Stalled: no new best in the last 3 sessions
            var bestBeforeLast3 = h.Take(h.Count - 3).Select(x => x.E1rm).DefaultIfEmpty(0).Max();
            var stalled = h.Count >= 4 && h.TakeLast(3).Max(x => x.E1rm) <= bestBeforeLast3;

            if (stalled)
                insights.Add(new CoachInsightDto
                {
                    Category = "training", Severity = "warning", Title = $"{name}: ilerleme durmuş",
                    Metric = metric,
                    Detail = "Son 3 antrenmanda bu harekette yeni en iyi değer yok. Aynı ağırlık ve tekrarla devam etmek vücuda yeni bir uyaran vermiyor.",
                    Action = $"Son en iyi setin {lastSet}. Bu hafta {Fmt(Math.Round(last.BestKg * 0.9m / 2.5m) * 2.5m)} kg ile hafif çalış (deload), sonra tekrar aralığını değiştir: {(last.BestReps >= 8 ? "5–6" : "8–10")} tekrarla {(last.BestReps >= 8 ? Fmt(last.BestKg + step) : Fmt(Math.Max(0, last.BestKg - step)))} kg dene.",
                });
            else if (changePct >= 2)
                insights.Add(new CoachInsightDto
                {
                    Category = "training", Severity = "good", Title = $"{name}: güçleniyorsun",
                    Metric = $"{metric} · +%{changePct.ToString("0.#", Tr)}",
                    Detail = "Kademeli yüklenme (progressive overload) çalışıyor: aynı harekette zamanla daha fazla ağırlık ya da tekrar yapabiliyorsun.",
                    Action = last.BestReps >= 8
                        ? $"Son en iyi setin {lastSet}. Bir sonraki antrenmanda {Fmt(last.BestKg + step)} kg ile {Math.Max(5, last.BestReps - 2)}–{last.BestReps - 1} tekrar dene."
                        : $"Son en iyi setin {lastSet}. Bir sonraki antrenmanda aynı ağırlıkla {last.BestReps + 1}–{last.BestReps + 2} tekrar dene; 8 tekrara ulaşınca {Fmt(last.BestKg + step)} kg'a geç.",
                });
            else if (changePct <= -3)
                insights.Add(new CoachInsightDto
                {
                    Category = "recovery", Severity = "warning", Title = $"{name}: performans düşüyor",
                    Metric = $"{metric} · %{changePct.ToString("0.#", Tr)}",
                    Detail = "Güçteki düşüş genellikle yetersiz toparlanma, düşük kalori/protein ya da uykuyla ilgilidir.",
                    Action = "Bu hafta hacmi azalt, uyku ve proteini kontrol et; kalori açığındaysan açığı biraz küçült.",
                });
        }
    }

    private static void WeeklyVolume(IReadOnlyList<CoachSession> sessions, DateTime now, List<CoachInsightDto> insights)
    {
        var recent = sessions.Where(s => s.StartedAt >= now.AddDays(-28)).ToList();
        if (recent.Count == 0) return;

        var setsPerGroup = MuscleGroups.ToDictionary(m => m.Group, _ => 0);
        foreach (var set in recent.SelectMany(s => s.Sets).Where(x => !x.IsWarmup))
        {
            var name = set.Exercise.ToLowerInvariant();
            var group = MuscleGroups.FirstOrDefault(m => m.Keys.Any(name.Contains)).Group;
            if (group != null) setsPerGroup[group]++;
        }
        var weekly = setsPerGroup.ToDictionary(kv => kv.Key, kv => Math.Round(kv.Value / 4m, 1));
        var trained = weekly.Where(kv => kv.Value > 0).ToList();
        if (trained.Count == 0) return;

        var low = weekly.Where(kv => kv.Value < 6).Select(kv => kv.Key).ToList();
        var high = weekly.Where(kv => kv.Value > 22).Select(kv => kv.Key).ToList();
        var metric = string.Join(" · ", weekly.Select(kv => $"{kv.Key} {kv.Value.ToString(Tr)}"));

        if (low.Count > 0)
            insights.Add(new CoachInsightDto
            {
                Category = "training", Severity = "info", Title = "Bazı kas grupları az çalışıyor",
                Metric = $"Haftalık çalışma seti: {metric}",
                Detail = $"Kas gelişimi için genelde kas grubu başına haftada 10–20 çalışma seti önerilir. Şu an düşük kalanlar: {string.Join(", ", low)}.",
                Action = $"{string.Join(", ", low)} için mevcut günlerine 2–3 hareket × 3 set ekle; haftalık 10 sete yaklaşmak yeterli bir başlangıç.",
            });
        if (high.Count > 0)
            insights.Add(new CoachInsightDto
            {
                Category = "recovery", Severity = "warning", Title = "Bazı kas gruplarında hacim çok yüksek",
                Metric = $"Haftalık çalışma seti: {metric}",
                Detail = $"{string.Join(", ", high)} için haftalık set sayısı 22'nin üstünde; bu çoğu kişide toparlanmayı zorlar ve ek fayda sağlamaz.",
                Action = "Bu gruplarda en az verimli 1–2 hareketi çıkar; seti azaltıp kalan setlerde ağırlığa odaklan.",
            });
        if (low.Count == 0 && high.Count == 0)
            insights.Add(new CoachInsightDto
            {
                Category = "training", Severity = "good", Title = "Antrenman hacmin dengeli",
                Metric = $"Haftalık çalışma seti: {metric}",
                Detail = "Tüm ana kas gruplarını haftada önerilen aralıkta çalıştırıyorsun.",
                Action = "Hacmi sabit tutup ağırlık artışına odaklan.",
            });
    }

    private static void Effort(IReadOnlyList<CoachSession> sessions, DateTime now, List<CoachInsightDto> insights)
    {
        var rpes = sessions.Where(s => s.StartedAt >= now.AddDays(-28))
            .SelectMany(s => s.Sets).Where(x => !x.IsWarmup && x.Rpe.HasValue).Select(x => x.Rpe!.Value).ToList();
        if (rpes.Count < 6) return;
        var avg = rpes.Average();
        var maxed = rpes.Count(r => r >= 9.5m) / (decimal)rpes.Count;
        if (avg >= 9 || maxed > 0.4m)
            insights.Add(new CoachInsightDto
            {
                Category = "recovery", Severity = "warning", Title = "Setlerin çoğunu tükenişe yakın yapıyorsun",
                Metric = $"Ortalama RPE {avg.ToString("0.0", Tr)} · setlerin %{(maxed * 100).ToString("0", Tr)}'i RPE 9,5+",
                Detail = "Her seti son tekrara kadar götürmek yorgunluğu hızla biriktirir ve sonraki setlerin kalitesini düşürür.",
                Action = "Çoğu seti 1–2 tekrar yedekte bırakarak (RPE 8–9) bitir; sadece hareketin son setinde sınıra yaklaş.",
            });
        else if (avg < 7)
            insights.Add(new CoachInsightDto
            {
                Category = "training", Severity = "info", Title = "Setler fazla rahat olabilir",
                Metric = $"Ortalama RPE {avg.ToString("0.0", Tr)}",
                Detail = "RPE 7'nin altındaki setler kas gelişimi için genellikle yeterli uyaran sağlamaz.",
                Action = "Ağırlığı, setin sonunda 1–3 tekrar daha yapabileceğin kadar artır (RPE 7–9).",
            });
    }

    private static void Nutrition(CoachProfile p, IReadOnlyList<CoachMeal> meals, DateTime now, CoachTargetsDto t, CoachStatsDto stats, List<CoachInsightDto> insights)
    {
        var recent = meals.Where(m => m.Date >= now.AddDays(-14)).ToList();
        var days = recent.GroupBy(m => m.Date.Date).ToList();
        stats.LoggedNutritionDays = days.Count;
        if (days.Count == 0)
        {
            insights.Add(new CoachInsightDto
            {
                Category = "nutrition", Severity = "info", Title = "Beslenme kaydı yok",
                Detail = "Son 2 haftada öğün kaydı olmadığı için kalori ve proteinini değerlendiremiyorum.",
                Action = $"Birkaç gün öğünlerini kaydet. Senin için tahmini hedef: günde ~{t.Calories} kcal ve {t.ProteinG} g protein.",
            });
            return;
        }

        // Only use complete-looking days (at least 2 meals) for averages
        var full = days.Where(d => d.Count() >= 2).ToList();
        var sample = full.Count >= 3 ? full : days;
        var kcal = (int)sample.Average(d => d.Sum(m => m.Calories));
        var protein = (int)sample.Average(d => (double)d.Sum(m => m.Protein));
        stats.AverageDailyCalories = kcal;
        stats.AverageDailyProtein = protein;
        stats.ProteinPerKg = p.WeightKg > 0 ? Math.Round(protein / p.WeightKg, 1) : 0;

        if (days.Count < 7)
            insights.Add(new CoachInsightDto
            {
                Category = "nutrition", Severity = "info", Title = "Beslenme kaydın eksik",
                Metric = $"Son 14 günün {days.Count} gününde kayıt var",
                Detail = days.Count < 4
                    ? "Bu kadar az kayıtla kalori ve protein ortalaman güvenilir değil, bu yüzden yorum yapmıyorum."
                    : "Az günlük kayıtla ortalamalar yanıltıcı olabilir.",
                Action = $"En az 5–7 gün art arda kayıt tut (hedefin: ~{t.Calories} kcal, {t.ProteinG} g protein). Beslenme sayfasındaki \"önceki günü kopyala\" benzer günlerde işini hızlandırır.",
            });
        if (days.Count < 4) return;

        var diff = kcal - t.Calories;
        var goalText = p.Goal switch { GoalType.Cut => "yağ kaybı", GoalType.Bulk => "kas kazanımı", _ => "kiloyu koruma" };
        if (Math.Abs(diff) <= t.Calories * 0.1)
            insights.Add(new CoachInsightDto
            {
                Category = "nutrition", Severity = "good", Title = "Kalorin hedefinle uyumlu",
                Metric = $"Günlük ortalama {kcal} kcal · hedef ~{t.Calories} kcal",
                Detail = $"{goalText} hedefi için kalori alımın doğru aralıkta.",
                Action = "Bu aralığı koru; kilo trendine göre gerekirse 100–200 kcal ince ayar yap.",
            });
        else
            insights.Add(new CoachInsightDto
            {
                Category = "nutrition", Severity = Math.Abs(diff) > t.Calories * 0.2 ? "warning" : "info",
                Title = diff > 0 ? "Hedefinden fazla kalori alıyorsun" : "Hedefinden az kalori alıyorsun",
                Metric = $"Günlük ortalama {kcal} kcal · hedef ~{t.Calories} kcal ({(diff > 0 ? "+" : "")}{diff})",
                Detail = diff > 0
                    ? (p.Goal == GoalType.Cut ? "Bu fazla, yağ kaybını durdurur." : "Fazlası kas yerine yağ olarak depolanma eğiliminde.")
                    : (p.Goal == GoalType.Bulk ? "Bu açıkla kas kazanmak çok zor." : "Uzun süreli büyük açık güç kaybına ve yorgunluğa yol açar."),
                Action = diff > 0
                    ? $"Günde yaklaşık {Math.Min(500, diff)} kcal azalt: önce içecek, sos ve atıştırmalıklardan başla."
                    : $"Günde yaklaşık {Math.Min(500, -diff)} kcal ekle: öğünlerine bir avuç kuruyemiş, yulaf ya da pilav porsiyonu iyi bir başlangıç.",
            });

        if (protein < t.ProteinG * 0.85)
            insights.Add(new CoachInsightDto
            {
                Category = "nutrition", Severity = "warning", Title = "Protein yetersiz",
                Metric = $"Günlük ortalama {protein} g ({stats.ProteinPerKg.ToString(Tr)} g/kg) · hedef {t.ProteinG} g",
                Detail = "Yeterli protein olmadan antrenmanın kas olarak karşılığını tam alamazsın; diyette ise kas kaybı riski artar.",
                Action = $"Günde {t.ProteinG - protein} g daha protein ekle: örn. 200 g süzme yoğurt (~20 g), 1 ölçek whey (~24 g) ya da 150 g tavuk göğsü (~45 g).",
            });
        else
            insights.Add(new CoachInsightDto
            {
                Category = "nutrition", Severity = "good", Title = "Protein alımın yeterli",
                Metric = $"Günlük ortalama {protein} g ({stats.ProteinPerKg.ToString(Tr)} g/kg)",
                Detail = "Kas kazanımı ve korunması için önerilen aralıktasın.",
                Action = "Proteini gün içine 3–5 öğüne yaymak kullanımını iyileştirir.",
            });
    }

    private static void BodyTrend(CoachProfile p, IReadOnlyList<CoachWeighIn> weighIns, CoachTargetsDto t, CoachStatsDto stats, List<CoachInsightDto> insights)
    {
        var w = weighIns.OrderBy(x => x.Date).ToList();
        if (w.Count < 2 || w[^1].Date.DayNumber - w[0].Date.DayNumber < 10)
        {
            insights.Add(new CoachInsightDto
            {
                Category = "body", Severity = "info", Title = "Kilo trendi için veri az",
                Detail = "Hedefe doğru ilerleyip ilerlemediğini görmek için en az 2 hafta aralıklı kilo ölçümü gerekiyor.",
                Action = "Haftada 1–2 kez, sabah aç karnına tartılıp Vücut Takibi'ne ekle.",
            });
            return;
        }

        var weeks = (w[^1].Date.DayNumber - w[0].Date.DayNumber) / 7m;
        var perWeek = Math.Round((w[^1].WeightKg - w[0].WeightKg) / weeks, 2);
        stats.WeightChangePerWeek = perWeek;
        var pct = p.WeightKg > 0 ? perWeek / p.WeightKg * 100 : 0;
        var metric = $"{Fmt(w[0].WeightKg)} → {Fmt(w[^1].WeightKg)} kg · haftada {(perWeek > 0 ? "+" : "")}{perWeek.ToString(Tr)} kg";

        (decimal min, decimal max, string ideal) = p.Goal switch
        {
            GoalType.Cut => (-1.0m, -0.4m, "haftada vücut ağırlığının %0,4–1'i kadar kayıp"),
            GoalType.Bulk => (0.1m, 0.5m, "haftada %0,1–0,5 artış"),
            _ => (-0.2m, 0.2m, "kilonun ±%0,2 içinde sabit kalması"),
        };

        if (pct >= min && pct <= max)
            insights.Add(new CoachInsightDto
            {
                Category = "body", Severity = "good", Title = "Kilo trendin hedefinle uyumlu",
                Metric = metric, Detail = $"İdeal hız {ideal}; tam bu aralıktasın.",
                Action = "Mevcut kalori ve antrenman düzenini sürdür.",
            });
        else
        {
            var tooFast = pct < min || (p.Goal == GoalType.Bulk && pct > max);
            // ~7700 kcal per kg of body weight → kcal/day to shift the weekly rate back into range
            var targetPct = (min + max) / 2;
            var kcalAdjust = (int)Math.Round((double)((targetPct - pct) / 100 * p.WeightKg) * 7700 / 7 / 50) * 50;
            insights.Add(new CoachInsightDto
            {
                Category = "body", Severity = "warning",
                Title = p.Goal switch
                {
                    GoalType.Cut when pct > max => "Beklenen hızda kilo vermiyorsun",
                    GoalType.Cut => "Çok hızlı kilo veriyorsun",
                    GoalType.Bulk when pct < min => "Kilo almıyorsun",
                    GoalType.Bulk => "Çok hızlı kilo alıyorsun",
                    _ => perWeek > 0 ? "Kilon artıyor" : "Kilon azalıyor",
                },
                Metric = metric,
                Detail = $"Hedefin için ideal hız {ideal}." + (tooFast && p.Goal == GoalType.Cut ? " Bu hızda kas kaybı riski artar." : ""),
                Action = kcalAdjust > 0
                    ? $"Günlük kaloriyi yaklaşık {kcalAdjust} kcal artır ve 2 hafta sonra trende tekrar bak."
                    : $"Günlük kaloriyi yaklaşık {-kcalAdjust} kcal azalt ve 2 hafta sonra trende tekrar bak.",
            });
        }
    }

    private static string Fmt(decimal v) => v.ToString("0.##", Tr);
}
