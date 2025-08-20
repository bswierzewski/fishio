using Microsoft.Extensions.DependencyInjection;

namespace Fishio.IdentityAccess.Infrastructure;

/// <summary>
/// Dependency injection configuration for IdentityAccess Infrastructure layer
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds IdentityAccess Infrastructure services to the DI container
    /// </summary>
    /// <param name="services">Service collection</param>
    /// <returns>Service collection for chaining</returns>
    public static IServiceCollection AddIdentityAccessInfrastructure(this IServiceCollection services)
    {
        // TODO: Add Entity Framework DbContext
        // TODO: Add repositories
        // TODO: Add external services
        // TODO: Add message handlers
        
        return services;
    }
}