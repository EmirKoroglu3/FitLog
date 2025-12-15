using FluentValidation;
using FitLog.Application.DTOs.Workout;

namespace FitLog.Application.Validators.Workout;

/// <summary>
/// Egzersiz oluşturma isteği doğrulayıcısı.
/// </summary>
public class CreateExerciseRequestValidator : AbstractValidator<CreateExerciseRequest>
{
    public CreateExerciseRequestValidator()
    {
        RuleFor(x => x.WorkoutDayId)
            .NotEmpty().WithMessage("Antrenman günü seçilmelidir.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Egzersiz adı zorunludur.")
            .MaximumLength(100).WithMessage("Egzersiz adı en fazla 100 karakter olabilir.");

        RuleFor(x => x.SetCount)
            .GreaterThan(0).WithMessage("Set sayısı 0'dan büyük olmalıdır.")
            .LessThanOrEqualTo(20).WithMessage("Set sayısı en fazla 20 olabilir.");

        RuleFor(x => x.Reps)
            .GreaterThan(0).WithMessage("Tekrar sayısı 0'dan büyük olmalıdır.")
            .LessThanOrEqualTo(100).WithMessage("Tekrar sayısı en fazla 100 olabilir.");

        RuleFor(x => x.Weight)
            .GreaterThanOrEqualTo(0).When(x => x.Weight.HasValue)
            .WithMessage("Ağırlık negatif olamaz.");
    }
}

