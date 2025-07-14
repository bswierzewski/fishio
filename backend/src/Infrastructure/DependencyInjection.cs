using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Fishio.Application.Common.Interfaces;
using Fishio.Infrastructure.Persistence;
using Fishio.Infrastructure.Services;
using Infrastructure.Data.Interceptors;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Fishio.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Add interceptors
        services.AddScoped<ISaveChangesInterceptor, AuditableEntityInterceptor>();
        services.AddScoped<ISaveChangesInterceptor, DispatchDomainEventsInterceptor>(); ;

        // Add DbContext with interceptors
        services.AddDbContext<ApplicationDbContext>((serviceProvider, options) =>
        {
            options.AddInterceptors(serviceProvider.GetServices<ISaveChangesInterceptor>());
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"));
        });

        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());
        services.AddScoped<ApplicationDbInitializer>();

        // Add TimeProvider for .NET 9
        services.AddSingleton(TimeProvider.System);

        // Add services
        services.AddScoped<ICurrentUserService, CurrentUserService>();

        return services;
    }
}