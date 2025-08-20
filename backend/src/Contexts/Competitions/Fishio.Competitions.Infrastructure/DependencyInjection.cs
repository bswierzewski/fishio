using Microsoft.Extensions.DependencyInjection;

namespace Fishio.Competitions.Infrastructure;

/// <summary>
/// Dependency injection configuration for Competitions Infrastructure layer
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds Competitions Infrastructure services to the DI container
    /// </summary>
    /// <param name="services">Service collection</param>
    /// <returns>Service collection for chaining</returns>
    public static IServiceCollection AddCompetitionsInfrastructure(this IServiceCollection services)
    {
        // TODO: Add Entity Framework DbContext
        // TODO: Add repositories
        // TODO: Add external services
        // TODO: Add message handlers
        
        return services;
    }
}
