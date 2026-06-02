using System;

namespace Cverse.Application.DTOs
{
    public class SkillDto
    {
        public Guid Id { get; set; }
        public string YetenekAdi { get; set; } = null!;
    }

    public class CreateSkillDto
    {
        public string YetenekAdi { get; set; } = null!;
    }
}
