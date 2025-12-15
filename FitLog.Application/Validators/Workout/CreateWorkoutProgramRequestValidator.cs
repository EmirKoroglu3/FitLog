using FluentValidation;
using FitLog.Application.DTOs.Workout;

namespace FitLog.Application.Validators.Workout;

/// <summary>
/// Antrenman programı oluşturma isteği doğrulayıcısı.
/// </summary>
public class CreateWorkoutProgramRequestValidator : AbstractValidator<CreateWorkoutProgramRequest>
{
    public CreateWorkoutProgramRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Program adı zorunludur.")
            .MaximumLength(100).WithMessage("Program adı en fazla 100 karakter olabilir.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Açıklama en fazla 500 karakter olabilir.");
    }
}

