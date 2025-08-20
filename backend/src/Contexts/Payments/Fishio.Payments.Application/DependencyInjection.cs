using Microsoft.Extensions.DependencyInjection;

namespace Fishio.Payments.Application;

/// <summary>
/// Dependency injection configuration for Payments Application layer
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds Payments Application services to the DI container
    /// </summary>
    /// <param name="services">Service collection</param>
    /// <returns>Service collection for chaining</returns>
    public static IServiceCollection AddPaymentsApplication(this IServiceCollection services)
    {
        // TODO: Add MediatR
        // TODO: Add AutoMapper
        // TODO: Add FluentValidation
        // TODO: Add application services
        
        return services;
    }
}
