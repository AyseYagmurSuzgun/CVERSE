using FluentValidation;
using Cverse.Application.DTOs;

namespace Cverse.Application.Validators
{
    public class CreateSkillValidator : AbstractValidator<CreateSkillDto>
    {
        public CreateSkillValidator()
        {
            RuleFor(x => x.YetenekAdi)
                .NotEmpty().WithMessage("Yetenek adı alanı boş geçilemez.")
                .MaximumLength(100).WithMessage("Yetenek adı en fazla 100 karakter olabilir.");
        }
    }
}
