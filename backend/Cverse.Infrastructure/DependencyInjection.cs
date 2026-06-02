using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Cverse.Application.Interfaces;
using Cverse.Infrastructure.Services;
using Cverse.Infrastructure.SignalR;

namespace Cverse.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IFileService, FileService>();
            services.AddScoped<IProfileService, ProfileService>();
            services.AddScoped<IPostService, PostService>();

            // Realtime Services
            services.AddSingleton<IConnectionManager, ConnectionManager>();
            services.AddScoped<INotificationService, NotificationService>();
            services.AddScoped<IChatService, ChatService>();
            
            return services;
        }
    }
}
