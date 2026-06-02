using FluentValidation;
using Cverse.Application.DTOs;

namespace Cverse.Application.Validators
{
    public class LoginRequestValidator : AbstractValidator<LoginRequestDto>
    {
        public LoginRequestValidator()
        {
            RuleFor(x => x.EmailOrUsername)
                .NotEmpty().WithMessage("E-posta veya kullanıcı adı boş geçilemez.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Şifre alanı boş geçilemez.");
        }
    }
}
