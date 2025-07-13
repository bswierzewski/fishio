using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using FluentValidation;
using MediatR;
using Fishio.Application.Common.Behaviours;

namespace Fishio.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // AutoMapper Configuration
        services.AddAutoMapper(Assembly.GetExecutingAssembly());

        // FluentValidation Configuration
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        // MediatR Configuration
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(UnhandledExceptionBehaviour<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehaviour<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(PerformanceBehaviour<,>));
        });

        return services;
    }
}