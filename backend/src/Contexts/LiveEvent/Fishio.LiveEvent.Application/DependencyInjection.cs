using Microsoft.Extensions.DependencyInjection;

namespace Fishio.LiveEvent.Application;

/// <summary>
/// Dependency injection configuration for LiveEvent Application layer
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds LiveEvent Application services to the DI container
    /// </summary>
    /// <param name="services">Service collection</param>
    /// <returns>Service collection for chaining</returns>
    public static IServiceCollection AddLiveEventApplication(this IServiceCollection services)
    {
        // TODO: Add MediatR
        // TODO: Add AutoMapper
        // TODO: Add FluentValidation
        // TODO: Add application services
        
        return services;
    }
}
