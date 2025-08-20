using Microsoft.Extensions.DependencyInjection;

namespace Fishio.Scoring.Infrastructure;

/// <summary>
/// Dependency injection configuration for Scoring Infrastructure layer
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds Scoring Infrastructure services to the DI container
    /// </summary>
    /// <param name="services">Service collection</param>
    /// <returns>Service collection for chaining</returns>
    public static IServiceCollection AddScoringInfrastructure(this IServiceCollection services)
    {
        // TODO: Add Entity Framework DbContext
        // TODO: Add repositories
        // TODO: Add external services
        // TODO: Add message handlers
        
        return services;
    }
}
