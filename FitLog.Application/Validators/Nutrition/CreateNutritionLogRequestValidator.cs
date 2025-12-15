using FluentValidation;
using FitLog.Application.DTOs.Nutrition;

namespace FitLog.Application.Validators.Nutrition;

/// <summary>
/// Beslenme kaydı oluşturma isteği doğrulayıcısı.
/// </summary>
public class CreateNutritionLogRequestValidator : AbstractValidator<CreateNutritionLogRequest>
{
    public CreateNutritionLogRequestValidator()
    {
        RuleFor(x => x.Date)
            .NotEmpty().WithMessage("Tarih zorunludur.")
            .LessThanOrEqualTo(DateTime.UtcNow.AddDays(1)).WithMessage("Gelecek tarihe kayıt eklenemez.");

        RuleFor(x => x.Calories)
            .GreaterThanOrEqualTo(0).WithMessage("Kalori negatif olamaz.")
            .LessThanOrEqualTo(10000).WithMessage("Kalori değeri çok yüksek.");

        RuleFor(x => x.Protein)
            .GreaterThanOrEqualTo(0).WithMessage("Protein negatif olamaz.")
            .LessThanOrEqualTo(500).WithMessage("Protein değeri çok yüksek.");

        RuleFor(x => x.Carbohydrates)
            .GreaterThanOrEqualTo(0).When(x => x.Carbohydrates.HasValue)
            .WithMessage("Karbonhidrat negatif olamaz.");

        RuleFor(x => x.Fat)
            .GreaterThanOrEqualTo(0).When(x => x.Fat.HasValue)
            .WithMessage("Yağ negatif olamaz.");
    }
}

