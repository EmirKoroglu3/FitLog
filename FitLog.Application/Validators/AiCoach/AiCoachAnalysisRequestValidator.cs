using FluentValidation;
using FitLog.Application.DTOs.AiCoach;

namespace FitLog.Application.Validators.AiCoach;

/// <summary>
/// AI Coach analiz isteği doğrulayıcısı.
/// </summary>
public class AiCoachAnalysisRequestValidator : AbstractValidator<AiCoachAnalysisRequestDto>
{
    public AiCoachAnalysisRequestValidator()
    {
        RuleFor(x => x.Height)
            .GreaterThan(0).WithMessage("Boy 0'dan büyük olmalıdır.")
            .LessThanOrEqualTo(300).WithMessage("Boy geçerli bir değer olmalıdır (cm).");

        RuleFor(x => x.Weight)
            .GreaterThan(0).WithMessage("Kilo 0'dan büyük olmalıdır.")
            .LessThanOrEqualTo(500).WithMessage("Kilo geçerli bir değer olmalıdır (kg).");

        RuleFor(x => x.BodyFatPercentage)
            .GreaterThanOrEqualTo(0).WithMessage("Yağ oranı negatif olamaz.")
            .LessThanOrEqualTo(60).WithMessage("Yağ oranı 0-60 arasında olmalıdır.");

        RuleFor(x => x.Goal)
            .IsInEnum().WithMessage("Hedef geçerli bir değer olmalıdır (Bulk, Cut, Maintain).");

        RuleFor(x => x.WeeklyWorkoutFrequency)
            .GreaterThan(0).WithMessage("Haftalık antrenman sayısı en az 1 olmalıdır.")
            .LessThanOrEqualTo(14).WithMessage("Haftalık antrenman sayısı 14'ü geçemez.");
    }
}
