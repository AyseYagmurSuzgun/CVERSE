using FluentValidation;
using Cverse.Application.DTOs;

namespace Cverse.Application.Validators
{
    public class UpdateUserProfileValidator : AbstractValidator<UpdateUserProfileDto>
    {
        public UpdateUserProfileValidator()
        {
            RuleFor(x => x.AdSoyad)
                .NotEmpty().WithMessage("Ad Soyad alanı boş geçilemez.")
                .MaximumLength(100).WithMessage("Ad Soyad en fazla 100 karakter olabilir.");

            RuleFor(x => x.Bio)
                .MaximumLength(1000).WithMessage("Hakkında alanı en fazla 1000 karakter olabilir.");

            RuleFor(x => x.Unvan)
                .MaximumLength(150).WithMessage("Ünvan alanı en fazla 150 karakter olabilir.");

            RuleFor(x => x.Konum)
                .MaximumLength(150).WithMessage("Konum alanı en fazla 150 karakter olabilir.");

            RuleFor(x => x.LinkedInUrl)
                .MaximumLength(256).WithMessage("LinkedIn adresi en fazla 256 karakter olabilir.");

            RuleFor(x => x.GitHubUrl)
                .MaximumLength(256).WithMessage("GitHub adresi en fazla 256 karakter olabilir.");

            RuleFor(x => x.TwitterUrl)
                .MaximumLength(256).WithMessage("Twitter adresi en fazla 256 karakter olabilir.");

            RuleFor(x => x.WebsiteUrl)
                .MaximumLength(256).WithMessage("Web sitesi adresi en fazla 256 karakter olabilir.");
        }
    }
}
