using FluentValidation;
using FitLog.Application.DTOs.Auth;

namespace FitLog.Application.Validators.Auth;

/// <summary>
/// Giriş isteği doğrulayıcısı.
/// </summary>
public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email adresi zorunludur.")
            .EmailAddress().WithMessage("Geçerli bir email adresi giriniz.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Şifre zorunludur.");
    }
}

