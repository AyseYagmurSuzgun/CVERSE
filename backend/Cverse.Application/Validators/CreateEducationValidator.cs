using FluentValidation;
using Cverse.Application.DTOs;

namespace Cverse.Application.Validators
{
    public class CreateEducationValidator : AbstractValidator<CreateEducationDto>
    {
        public CreateEducationValidator()
        {
            RuleFor(x => x.OkulAdi)
                .NotEmpty().WithMessage("Okul adı alanı boş geçilemez.")
                .MaximumLength(200).WithMessage("Okul adı en fazla 200 karakter olabilir.");

            RuleFor(x => x.Bolum)
                .NotEmpty().WithMessage("Bölüm alanı boş geçilemez.")
                .MaximumLength(200).WithMessage("Bölüm adı en fazla 200 karakter olabilir.");

            RuleFor(x => x.BaslangicTarihi)
                .NotEmpty().WithMessage("Başlangıç tarihi alanı boş geçilemez.");

            RuleFor(x => x.BitisTarihi)
                .GreaterThan(x => x.BaslangicTarihi)
                .When(x => x.BitisTarihi.HasValue)
                .WithMessage("Bitiş tarihi başlangıç tarihinden sonra olmalıdır.");

            RuleFor(x => x.Aciklama)
                .MaximumLength(1000).WithMessage("Açıklama en fazla 1000 karakter olabilir.");
        }
    }
}
