using Microsoft.Extensions.DependencyInjection;

namespace Fishio.LiveEvent.Infrastructure;

/// <summary>
/// Dependency injection configuration for LiveEvent Infrastructure layer
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds LiveEvent Infrastructure services to the DI container
    /// </summary>
    /// <param name="services">Service collection</param>
    /// <returns>Service collection for chaining</returns>
    public static IServiceCollection AddLiveEventInfrastructure(this IServiceCollection services)
    {
        // TODO: Add Entity Framework DbContext
        // TODO: Add repositories
        // TODO: Add external services
        // TODO: Add message handlers
        
        return services;
    }
}
