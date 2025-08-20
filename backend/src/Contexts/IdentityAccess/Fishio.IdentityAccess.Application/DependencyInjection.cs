using Microsoft.Extensions.DependencyInjection;

namespace Fishio.IdentityAccess.Application;

/// <summary>
/// Dependency injection configuration for IdentityAccess Application layer
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds IdentityAccess Application services to the DI container
    /// </summary>
    /// <param name="services">Service collection</param>
    /// <returns>Service collection for chaining</returns>
    public static IServiceCollection AddIdentityAccessApplication(this IServiceCollection services)
    {
        // TODO: Add MediatR
        // TODO: Add AutoMapper
        // TODO: Add FluentValidation
        // TODO: Add application services
        
        return services;
    }
}