using Microsoft.Extensions.DependencyInjection;

namespace Fishio.Venues.Application;

/// <summary>
/// Dependency injection configuration for Venues Application layer
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds Venues Application services to the DI container
    /// </summary>
    /// <param name="services">Service collection</param>
    /// <returns>Service collection for chaining</returns>
    public static IServiceCollection AddVenuesApplication(this IServiceCollection services)
    {
        // TODO: Add MediatR
        // TODO: Add AutoMapper
        // TODO: Add FluentValidation
        // TODO: Add application services
        
        return services;
    }
}
