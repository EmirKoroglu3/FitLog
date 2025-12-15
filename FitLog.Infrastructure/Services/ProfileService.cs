using FitLog.Application.DTOs.Profile;
using FitLog.Application.Services;
using FitLog.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;

namespace FitLog.Infrastructure.Services;

public class ProfileService : IProfileService
{
    private readonly UserManager<ApplicationUser> _userManager;

    public ProfileService(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<ProfileDto?> GetProfileAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return null;

        return MapToProfileDto(user);
    }

    public async Task<ProfileDto?> UpdateProfileAsync(Guid userId, UpdateProfileRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return null;

        if (!string.IsNullOrEmpty(request.Name))
            user.Name = request.Name;
        if (!string.IsNullOrEmpty(request.Surname))
            user.Surname = request.Surname;
        if (request.Height.HasValue)
            user.Height = request.Height;
        if (request.Weight.HasValue)
            user.Weight = request.Weight;
        if (!string.IsNullOrEmpty(request.Gender))
            user.Gender = request.Gender;
        if (request.BirthDate.HasValue)
            user.BirthDate = DateTime.SpecifyKind(request.BirthDate.Value, DateTimeKind.Utc);
        if (!string.IsNullOrEmpty(request.FitnessGoal))
            user.FitnessGoal = request.FitnessGoal;
        if (!string.IsNullOrEmpty(request.ExperienceLevel))
            user.ExperienceLevel = request.ExperienceLevel;

        await _userManager.UpdateAsync(user);

        return MapToProfileDto(user);
    }

    public async Task<ProfileAnalysis> GetProfileAnalysisAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return new ProfileAnalysis
            {
                Profile = new ProfileDto(),
                Recommendations = new List<ProfileRecommendation>()
            };
        }

        var profile = MapToProfileDto(user);
        var recommendations = GenerateRecommendations(user);
        var suggestedProgram = GetSuggestedProgram(user);
        var (dailyCalories, dailyProtein) = CalculateNutritionNeeds(user);

        return new ProfileAnalysis
        {
            Profile = profile,
            Recommendations = recommendations,
            SuggestedProgram = suggestedProgram,
            DailyCalorieNeed = dailyCalories,
            DailyProteinNeed = dailyProtein
        };
    }

    private ProfileDto MapToProfileDto(ApplicationUser user)
    {
        var age = user.BirthDate.HasValue
            ? (int)((DateTime.Today - user.BirthDate.Value).TotalDays / 365.25)
            : (int?)null;

        decimal? bmi = null;
        string? bmiCategory = null;

        if (user.Height.HasValue && user.Weight.HasValue && user.Height > 0)
        {
            var heightInMeters = user.Height.Value / 100m;
            bmi = Math.Round(user.Weight.Value / (heightInMeters * heightInMeters), 1);
            bmiCategory = GetBmiCategory(bmi.Value);
        }

        return new ProfileDto
        {
            Id = user.Id.ToString(),
            Email = user.Email ?? "",
            Name = user.Name,
            Surname = user.Surname,
            Height = user.Height,
            Weight = user.Weight,
            Gender = user.Gender,
            BirthDate = user.BirthDate,
            FitnessGoal = user.FitnessGoal,
            ExperienceLevel = user.ExperienceLevel,
            Age = age,
            Bmi = bmi,
            BmiCategory = bmiCategory
        };
    }

    private string GetBmiCategory(decimal bmi)
    {
        return bmi switch
        {
            < 18.5m => "Zayıf",
            < 25m => "Normal",
            < 30m => "Fazla Kilolu",
            _ => "Obez"
        };
    }

    private List<ProfileRecommendation> GenerateRecommendations(ApplicationUser user)
    {
        var recommendations = new List<ProfileRecommendation>();

        // BMI bazlı öneriler
        if (user.Height.HasValue && user.Weight.HasValue && user.Height > 0)
        {
            var heightInMeters = user.Height.Value / 100m;
            var bmi = user.Weight.Value / (heightInMeters * heightInMeters);

            if (bmi < 18.5m)
            {
                recommendations.Add(new ProfileRecommendation
                {
                    Category = "Beslenme",
                    Title = "Kalori Fazlası Önerilir",
                    Description = "Kas kütlesi kazanmak için günlük kalori alımınızı artırmanız önerilir. Protein ağırlıklı beslenmeye önem verin.",
                    Icon = "🍽️"
                });
                recommendations.Add(new ProfileRecommendation
                {
                    Category = "Antrenman",
                    Title = "Ağırlık Antrenmanı",
                    Description = "Compound hareketlere (squat, deadlift, bench press) odaklanın. Haftada 3-4 gün antrenman yapın.",
                    Icon = "🏋️"
                });
            }
            else if (bmi >= 25m && bmi < 30m)
            {
                recommendations.Add(new ProfileRecommendation
                {
                    Category = "Beslenme",
                    Title = "Kalori Açığı Önerilir",
                    Description = "Yağ yakımı için hafif kalori açığı oluşturun. Protein alımını yüksek tutun (vücut ağırlığı kg başına 1.6-2g).",
                    Icon = "🥗"
                });
                recommendations.Add(new ProfileRecommendation
                {
                    Category = "Kardiyo",
                    Title = "HIIT veya LISS Kardiyo",
                    Description = "Haftada 2-3 gün kardiyo ekleyin. HIIT yağ yakımını hızlandırır, LISS ise toparlanmayı destekler.",
                    Icon = "🏃"
                });
            }
            else if (bmi >= 30m)
            {
                recommendations.Add(new ProfileRecommendation
                {
                    Category = "Beslenme",
                    Title = "Beslenme Düzeni",
                    Description = "Kalori açığı ile başlayın. İşlenmiş gıdalardan kaçının, tam gıdalara yönelin. Su tüketiminizi artırın.",
                    Icon = "🍎"
                });
                recommendations.Add(new ProfileRecommendation
                {
                    Category = "Antrenman",
                    Title = "Düşük Etkili Egzersiz",
                    Description = "Yürüyüş, bisiklet veya yüzme ile başlayın. Eklemlerinizi koruyun, yavaş yavaş yoğunluğu artırın.",
                    Icon = "🚶"
                });
            }
            else
            {
                recommendations.Add(new ProfileRecommendation
                {
                    Category = "Genel",
                    Title = "İdeal Aralıktasınız!",
                    Description = "Vücut kitle indeksiniz normal aralıkta. Mevcut durumunuzu korumak veya hedeflerinize göre geliştirmek için devam edin.",
                    Icon = "✅"
                });
            }
        }

        // Hedef bazlı öneriler
        switch (user.FitnessGoal)
        {
            case "Kas Yapma":
                recommendations.Add(new ProfileRecommendation
                {
                    Category = "Takviye",
                    Title = "Kas Yapma Takviyeleri",
                    Description = "Whey Protein, Kreatin ve BCAA kas gelişiminizi destekleyebilir. Yeterli uyku almayı unutmayın.",
                    Icon = "💪"
                });
                break;
            case "Kilo Verme":
                recommendations.Add(new ProfileRecommendation
                {
                    Category = "Takviye",
                    Title = "Yağ Yakımı Desteği",
                    Description = "L-Karnitin ve Yeşil Çay ekstresi metabolizmayı destekleyebilir. Protein alımını yüksek tutun.",
                    Icon = "🔥"
                });
                break;
            case "Güç Artırma":
                recommendations.Add(new ProfileRecommendation
                {
                    Category = "Antrenman",
                    Title = "Güç Antrenmanı",
                    Description = "5x5 veya Starting Strength gibi programlar uygundur. Compound hareketlerde düşük tekrar, yüksek ağırlık çalışın.",
                    Icon = "⚡"
                });
                break;
        }

        // Seviye bazlı öneriler
        if (user.ExperienceLevel == "Başlangıç")
        {
            recommendations.Add(new ProfileRecommendation
            {
                Category = "Başlangıç",
                Title = "Form ve Teknik",
                Description = "Ağırlık eklemeden önce doğru formu öğrenin. İlk 2-3 ay düşük ağırlıklarla tekniğe odaklanın.",
                Icon = "📚"
            });
        }

        return recommendations;
    }

    private string GetSuggestedProgram(ApplicationUser user)
    {
        var goal = user.FitnessGoal ?? "";
        var level = user.ExperienceLevel ?? "Başlangıç";

        return (goal, level) switch
        {
            ("Kas Yapma", "Başlangıç") => "Full Body (Haftada 3 Gün)",
            ("Kas Yapma", "Orta") => "Push-Pull-Legs",
            ("Kas Yapma", "İleri") => "Push-Pull-Legs (6 Gün)",
            ("Kilo Verme", _) => "Full Body + Kardiyo",
            ("Güç Artırma", "Başlangıç") => "Starting Strength",
            ("Güç Artırma", "Orta") => "5/3/1 Programı",
            ("Güç Artırma", "İleri") => "Powerlifting Programı",
            ("Genel Sağlık", _) => "Full Body (Haftada 3 Gün)",
            _ => "Full Body (Haftada 3 Gün)"
        };
    }

    private (int calories, int protein) CalculateNutritionNeeds(ApplicationUser user)
    {
        if (!user.Weight.HasValue || !user.Height.HasValue || !user.BirthDate.HasValue)
            return (2000, 100);

        var weight = (double)user.Weight.Value;
        var height = (double)user.Height.Value;
        var age = (int)((DateTime.Today - user.BirthDate.Value).TotalDays / 365.25);

        // Harris-Benedict formülü (BMR)
        double bmr;
        if (user.Gender == "Erkek")
        {
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        }
        else
        {
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        }

        // Aktivite faktörü (orta aktif varsayalım: 1.55)
        var tdee = bmr * 1.55;

        // Hedefe göre kalori ayarlama
        var calories = user.FitnessGoal switch
        {
            "Kas Yapma" => (int)(tdee + 300),
            "Kilo Verme" => (int)(tdee - 500),
            _ => (int)tdee
        };

        // Protein ihtiyacı (kg başına 1.6-2g)
        var proteinMultiplier = user.FitnessGoal == "Kas Yapma" ? 2.0 : 1.6;
        var protein = (int)(weight * proteinMultiplier);

        return (calories, protein);
    }
}

