using System.Text.Json.Serialization;
using Application.Common.Options;
using Fishio.API.Infrastructure;
using Fishio.Application.Common.Options;
using Fishio.Domain.Constants;
using Fishio.Infrastructure.Filter; // Dla OpenApiSecurityScheme etc.
using Fishio.Infrastructure.Services;      // Dla CurrentUserService
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

namespace Fishio.API;

public static class DependencyInjection
{
    public static void AddWebServices(this IHostApplicationBuilder builder)
    {
        var services = builder.Services; // Dla czytelności

        // --- Configure Options ---
        // This section centralizes the registration of all IOptions classes.
        // Each .Configure<T> call binds a configuration section (e.g., from appsettings.json) to a strongly-typed options class.

        // Clerk Authentication Settings
        services.Configure<ClerkOptions>(builder.Configuration.GetSection(ClerkOptions.SectionName));
        // Note: ClerkOptions are also retrieved directly below for immediate use in JWT Bearer config.
        // Consider if this direct retrieval is still needed if IOptions<ClerkOptions> is injected elsewhere.

        // Cloudinary Settings
        services.Configure<CloudinaryOptions>(builder.Configuration.GetSection(CloudinaryOptions.SectionName));

        // --- Konfiguracja Kontrolerów (jeśli używasz, choć projekt jest Minimal API) ---
        // Jeśli projekt jest czysto Minimal API, ta linia może nie być potrzebna.
        // Jeśli masz jakieś kontrolery (np. dla widoków błędów), zostaw.
        //services.AddControllers();

        // --- Konfiguracja Swagger/OpenAPI ---
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo { Title = "Fishio API", Version = "v1" });
            options.SchemaFilter<EnumSchemaFilter>();

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

        services.ConfigureHttpJsonOptions(services =>
        {
            // Ustawienia dla JSON, jeśli używasz System.Text.Json
            services.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
        });

        // --- Konfiguracja Zachowania API ---
        // Wyłącza automatyczną walidację ModelState przez filtr [ApiController],
        // co daje większą kontrolę, jeśli używasz np. FluentValidation z MediatR.
        services.Configure<ApiBehaviorOptions>(options =>
            options.SuppressModelStateInvalidFilter = true);

        // --- Konfiguracja Obsługi Wyjątków ---
        services.AddExceptionHandler<CustomExceptionHandler>(); // Odkomentuj, jeśli masz zaimplementowany

        // --- Konfiguracja Dostępności HttpContext ---
        services.AddHttpContextAccessor();

        // Rejestracja ICurrentUserService
        services.AddScoped<ICurrentUserService, CurrentUserService>();

        // --- Konfiguracja Uwierzytelniania JWT (dla Clerk) ---
        // The direct Get<ClerkOptions>() below might be redundant if IOptions is used consistently.
        var clerkOptions = builder.Configuration.GetSection(ClerkOptions.SectionName).Get<ClerkOptions>()
            ?? throw new InvalidOperationException($"Configuration section '{ClerkOptions.SectionName}' not found or empty.");

        if (string.IsNullOrWhiteSpace(clerkOptions.Authority))
        {
            throw new InvalidOperationException($"'{nameof(ClerkOptions.Authority)}' must be configured in section '{ClerkOptions.SectionName}'.");
        }
        if (string.IsNullOrWhiteSpace(clerkOptions.Audience))
        {
            throw new InvalidOperationException($"'{nameof(ClerkOptions.Audience)}' must be configured in section '{ClerkOptions.SectionName}'.");
        }

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.Authority = clerkOptions.Authority;     // Z pola "iss"
                options.Audience = clerkOptions.Audience;      // Z pola "azp" (gdy "aud" brak)

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = clerkOptions.Authority, // Powtórzenie dla jawnej walidacji

                    ValidateAudience = true,
                    ValidAudiences = new[] { clerkOptions.Audience, "http://localhost:3000" }, // Accept both aud and azp values

                    ValidateIssuerSigningKey = true,
                    // Klucze zostaną pobrane z JWKS URI dostarczonego przez Authority

                    NameClaimType = "sub",
                    RoleClaimType = "permissions", // Dostosuj, jeśli Clerk używa innego claimu dla ról/uprawnień

                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromSeconds(30),

                    // Custom audience validation to handle both 'aud' and 'azp' claims
                    AudienceValidator = (audiences, securityToken, validationParameters) =>
                    {
                        // Accept if any of the token's audiences match our valid audiences
                        var validAudiences = validationParameters.ValidAudiences ?? new[] { clerkOptions.Audience };
                        return audiences?.Any(aud => validAudiences.Contains(aud)) == true;
                    }
                };
            });

        // --- Konfiguracja Autoryzacji (Polityki) ---
        services.AddAuthorization(options =>
        {
            // Przykładowe polityki - dostosuj do swoich potrzeb
            options.AddPolicy(PolicyNames.OrganizerPolicy, policy =>
                policy.RequireAuthenticatedUser()); // Możesz dodać .RequireClaim("permissions", "manage:competitions")
            options.AddPolicy(PolicyNames.JudgePolicy, policy =>
                policy.RequireAuthenticatedUser());
            // ... inne polityki ...
        });


        // --- Konfiguracja CORS (tylko w trybie deweloperskim w tym przykładzie) ---
        if (builder.Environment.IsDevelopment())
        {
            services.AddCors(options =>
            {
                options.AddDefaultPolicy(policyBuilder => // Zmieniono nazwę zmiennej dla jasności
                {
                    policyBuilder.AllowAnyOrigin()
                                 .AllowAnyMethod()
                                 .AllowAnyHeader();
                });
            });
        }
    }
}
