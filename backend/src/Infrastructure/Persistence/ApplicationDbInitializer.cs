using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Fishio.Infrastructure.Persistence;

public static class ApplicationDbInitializerExtensions
{
    public static async Task InitializeDatabaseAsync(this IHost host)
    {
        using var scope = host.Services.CreateScope();

        var initializer = scope.ServiceProvider.GetRequiredService<ApplicationDbInitializer>();

        await initializer.InitializeAsync();
    }
}

public class ApplicationDbInitializer
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ApplicationDbInitializer> _logger;

    public ApplicationDbInitializer(IServiceProvider serviceProvider, ILogger<ApplicationDbInitializer> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task InitializeAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        try
        {
            await MigrateDatabaseAsync(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while initializing the database");
            throw;
        }
    }

    private async Task MigrateDatabaseAsync(ApplicationDbContext context)
    {
        var pendingMigrations = await context.Database.GetPendingMigrationsAsync();

        if (pendingMigrations.Any())
        {
            _logger.LogInformation("Applying {Count} pending migrations", pendingMigrations.Count());
            await context.Database.MigrateAsync();
            _logger.LogInformation("Database migrations applied successfully");
        }
        else
        {
            _logger.LogInformation("Database is up to date - no migrations to apply");
        }
    }
}