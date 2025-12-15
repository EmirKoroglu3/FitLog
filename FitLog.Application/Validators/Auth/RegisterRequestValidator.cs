using FluentValidation;
using FitLog.Application.DTOs.Auth;

namespace FitLog.Application.Validators.Auth;

/// <summary>
/// Kayıt isteği doğrulayıcısı.
/// </summary>
public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email adresi zorunludur.")
            .EmailAddress().WithMessage("Geçerli bir email adresi giriniz.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Şifre zorunludur.")
            .MinimumLength(6).WithMessage("Şifre en az 6 karakter olmalıdır.")
            .Matches("[A-Z]").WithMessage("Şifre en az bir büyük harf içermelidir.")
            .Matches("[a-z]").WithMessage("Şifre en az bir küçük harf içermelidir.")
            .Matches("[0-9]").WithMessage("Şifre en az bir rakam içermelidir.");

        RuleFor(x => x.ConfirmPassword)
            .Equal(x => x.Password).WithMessage("Şifreler eşleşmiyor.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("İsim zorunludur.")
            .MaximumLength(50).WithMessage("İsim en fazla 50 karakter olabilir.");

        RuleFor(x => x.Surname)
            .NotEmpty().WithMessage("Soyisim zorunludur.")
            .MaximumLength(50).WithMessage("Soyisim en fazla 50 karakter olabilir.");
    }
}

