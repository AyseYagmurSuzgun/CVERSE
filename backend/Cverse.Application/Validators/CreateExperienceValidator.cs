using FluentValidation;
using Cverse.Application.DTOs;

namespace Cverse.Application.Validators
{
    public class CreateExperienceValidator : AbstractValidator<CreateExperienceDto>
    {
        public CreateExperienceValidator()
        {
            RuleFor(x => x.SirketAdi)
                .NotEmpty().WithMessage("Şirket adı alanı boş geçilemez.")
                .MaximumLength(200).WithMessage("Şirket adı en fazla 200 karakter olabilir.");

            RuleFor(x => x.Unvan)
                .NotEmpty().WithMessage("Ünvan alanı boş geçilemez.")
                .MaximumLength(150).WithMessage("Ünvan en fazla 150 karakter olabilir.");

            RuleFor(x => x.Konum)
                .MaximumLength(150).WithMessage("Konum en fazla 150 karakter olabilir.");

            RuleFor(x => x.BaslangicTarihi)
                .NotEmpty().WithMessage("Başlangıç tarihi alanı boş geçilemez.");

            RuleFor(x => x.BitisTarihi)
                .GreaterThan(x => x.BaslangicTarihi)
                .When(x => x.BitisTarihi.HasValue)
                .WithMessage("Bitiş tarihi başlangıç tarihinden sonra olmalıdır.");

            RuleFor(x => x.Aciklama)
                .MaximumLength(2000).WithMessage("Açıklama en fazla 2000 karakter olabilir.");
        }
    }
}
