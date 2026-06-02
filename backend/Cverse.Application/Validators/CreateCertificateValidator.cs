using FluentValidation;
using Cverse.Application.DTOs;

namespace Cverse.Application.Validators
{
    public class CreateCertificateValidator : AbstractValidator<CreateCertificateDto>
    {
        public CreateCertificateValidator()
        {
            RuleFor(x => x.SertifikaAdi)
                .NotEmpty().WithMessage("Sertifika adı alanı boş geçilemez.")
                .MaximumLength(200).WithMessage("Sertifika adı en fazla 200 karakter olabilir.");

            RuleFor(x => x.VerenKurum)
                .NotEmpty().WithMessage("Veren kurum alanı boş geçilemez.")
                .MaximumLength(200).WithMessage("Veren kurum adı en fazla 200 karakter olabilir.");

            RuleFor(x => x.VerilisTarihi)
                .NotEmpty().WithMessage("Veriliş tarihi alanı boş geçilemez.");

            RuleFor(x => x.SertifikaUrl)
                .MaximumLength(500).WithMessage("Sertifika adresi en fazla 500 karakter olabilir.");

            RuleFor(x => x.SertifikaId)
                .MaximumLength(100).WithMessage("Sertifika ID'si en fazla 100 karakter olabilir.");
        }
    }
}
