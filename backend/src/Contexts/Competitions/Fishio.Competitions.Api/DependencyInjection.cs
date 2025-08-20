using Microsoft.Extensions.DependencyInjection;

namespace Fishio.Competitions.Api;

/// <summary>
/// Dependency injection configuration for Competitions API layer
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds Competitions API services to the DI container
    /// </summary>
    /// <param name="services">Service collection</param>
    /// <returns>Service collection for chaining</returns>
    public static IServiceCollection AddCompetitionsApi(this IServiceCollection services)
    {
        // TODO: Add controllers
        // TODO: Add API-specific services
        // TODO: Add authentication/authorization
        // TODO: Add API versioning
        
        return services;
    }
}
