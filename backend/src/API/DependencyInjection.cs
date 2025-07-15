using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;
using Fishio.Application.Common.Options;
using Application.Common.Options;
using Microsoft.IdentityModel.Tokens;
using Fishio.API.Middleware;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;

namespace Fishio.API;

public static class DependencyInjection
{
    public static IServiceCollection AddAPI(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
    {
        // Configure Options from Common/Options
        services.Configure<ClerkOptions>(configuration.GetSection(ClerkOptions.SectionName));
        services.Configure<CloudinaryOptions>(configuration.GetSection(CloudinaryOptions.SectionName));

        // Configure services for layered error handling.
        // These services are used by the middleware configured in Program.cs.

        // 1. Add custom exception handler: Registers our custom IExceptionHandler implementation.
        // This class is responsible for translating specific, application-level exceptions
        // (e.g., ValidationException, NotFoundException) into detailed, user-friendly
        // ProblemDetails responses.
        services.AddExceptionHandler<CustomExceptionHandler>();

        // 2. Add ProblemDetails: Registers the default services required for ProblemDetails generation.
        // This is primarily used by the UseStatusCodePages middleware to handle generic HTTP errors
        // (like 401 Unauthorized or 404 Not Found when no endpoint is matched) that are not thrown
        // as exceptions from app logic, ensuring all error responses are standardized.
        services.AddProblemDetails();

        // Suppress model state invalid filter (for FluentValidation)
        services.Configure<ApiBehaviorOptions>(options => options.SuppressModelStateInvalidFilter = true);

        // Add HttpContextAccessor for CurrentUserService
        services.AddHttpContextAccessor();

        // Add OpenAPI/Swagger configuration
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo { Title = "Fishio API", Version = "v1" });

            // Add JWT Bearer security definition
            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                In = ParameterLocation.Header,
                Description = "Please enter a valid token",
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                BearerFormat = "JWT",
                Scheme = "bearer"
            });
            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
        });

        // Configure JWT Authentication with Clerk
        var clerkOptions = configuration.GetSection(ClerkOptions.SectionName).Get<ClerkOptions>();

        // Clerk options are required
        if (clerkOptions == null || string.IsNullOrEmpty(clerkOptions.Authority) || string.IsNullOrEmpty(clerkOptions.Audience))
            throw new InvalidOperationException("Clerk configuration is required. Please provide Authority and Audience in appsettings.json");

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.Authority = clerkOptions.Authority;
                options.Audience = clerkOptions.Audience;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = clerkOptions.Authority,
                    ValidateAudience = true,
                    ValidAudience = clerkOptions.Audience,
                    ValidateIssuerSigningKey = true,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero,

                    // Map claims from Clerk JWT to .NET ClaimsPrincipal
                    NameClaimType = "sub", // "sub" claim from JWT will be used as the user's unique identifier (ClaimTypes.NameIdentifier)
                    RoleClaimType = "roles" // "roles" claim from JWT will be used for role-based authorization ([Authorize(Roles = ...)])
                };
            });

        services.AddAuthorization();

        // Add CORS policy only for local development
        if (environment.IsDevelopment())
        {
            services.AddCors(options =>
            {
                options.AddDefaultPolicy(builder =>
                {
                    builder
                        .AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader();
                });
            });
        }

        return services;
    }
}