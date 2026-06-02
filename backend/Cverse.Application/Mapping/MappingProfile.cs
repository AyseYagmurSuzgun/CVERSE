using AutoMapper;
using Cverse.Domain.Entities;
using Cverse.Application.DTOs;

namespace Cverse.Application.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<ApplicationUser, UserDto>();
            CreateMap<RegisterRequestDto, ApplicationUser>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.KullaniciAdi));

            CreateMap<UserProfile, UserProfileDto>()
                .ForMember(dest => dest.AdSoyad, opt => opt.MapFrom(src => src.User.AdSoyad))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User.Email))
                .ForMember(dest => dest.KullaniciAdi, opt => opt.MapFrom(src => src.User.UserName))
                .ForMember(dest => dest.ProfilFotografiUrl, opt => opt.MapFrom(src => src.User.ProfilFotografiUrl))
                .ForMember(dest => dest.KapakFotografiUrl, opt => opt.MapFrom(src => src.User.KapakFotografiUrl))
                .ForMember(dest => dest.Educations, opt => opt.MapFrom(src => src.User.Educations))
                .ForMember(dest => dest.Experiences, opt => opt.MapFrom(src => src.User.Experiences))
                .ForMember(dest => dest.Skills, opt => opt.MapFrom(src => src.User.Skills))
                .ForMember(dest => dest.Certificates, opt => opt.MapFrom(src => src.User.Certificates));

            CreateMap<UpdateUserProfileDto, UserProfile>();

            CreateMap<Education, EducationDto>();
            CreateMap<CreateEducationDto, Education>();

            CreateMap<Experience, ExperienceDto>();
            CreateMap<CreateExperienceDto, Experience>();

            CreateMap<Skill, SkillDto>();
            CreateMap<CreateSkillDto, Skill>();

            CreateMap<Certificate, CertificateDto>();
            CreateMap<CreateCertificateDto, Certificate>();

            // Realtime mappings
            CreateMap<Notification, NotificationDto>()
                .ForMember(dest => dest.TriggeredByAdSoyad, opt => opt.MapFrom(src => src.TriggeredBy != null ? src.TriggeredBy.AdSoyad : null))
                .ForMember(dest => dest.TriggeredByProfilFotografiUrl, opt => opt.MapFrom(src => src.TriggeredBy != null ? src.TriggeredBy.ProfilFotografiUrl : null));

            CreateMap<Message, MessageDto>();
        }
    }
}
