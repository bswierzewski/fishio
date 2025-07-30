using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Testcontainers.PostgreSql;

namespace API.Tests.Common
{
    /// <summary>
    /// A custom WebApplicationFactory for integration tests.
    /// It sets up a test environment with a dedicated PostgreSQL database in a Testcontainer.
    /// </summary>
    /// <typeparam name="TProgram">The type of the entry point class of the application, typically Program.</typeparam>
    /// <typeparam name="TDbContext">The type of the DbContext used by the application.</typeparam>
    public class TestWebAppFactory<TProgram, TDbContext> : WebApplicationFactory<TProgram>, IAsyncLifetime
        where TProgram : class
        where TDbContext : DbContext
    {
        private readonly PostgreSqlContainer _dbContainer;

        /// <summary>
        /// Initializes a new instance of the <see cref="TestWebAppFactory{TProgram, TDbContext}"/> class.
        /// Configures the PostgreSQL Testcontainer.
        /// </summary>
        public TestWebAppFactory()
        {
            _dbContainer = new PostgreSqlBuilder()
                .WithImage("postgres:16")
                .WithCleanUp(true)
                .Build();
        }

        /// <summary>
        /// Configures the web host by setting the environment to "Testing" and replacing the
        /// production database context with a test-specific one using the Testcontainer's connection string.
        /// </summary>
        /// <param name="builder">The IWebHostBuilder to configure.</param>
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");

            builder.ConfigureTestServices(services =>
            {
                services.RemoveAll(typeof(DbContextOptions<TDbContext>));
                services.AddDbContext<TDbContext>(options =>
                {
                    options.UseNpgsql(_dbContainer.GetConnectionString());
                });
            });
        }

        /// <summary>
        /// Starts the PostgreSQL container and applies any pending database migrations.
        /// This is called once before any tests are run.
        /// </summary>
        public async Task InitializeAsync()
        {
            await _dbContainer.StartAsync();
            using var scope = Services.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<TDbContext>();
            await dbContext.Database.MigrateAsync();
        }

        /// <summary>
        /// Disposes the factory and stops the PostgreSQL container.
        /// This is called once after all tests have completed.
        /// </summary>
        public new async Task DisposeAsync()
        {
            await _dbContainer.DisposeAsync();
            await base.DisposeAsync();
        }

        /// <summary>
        /// Gets the connection string for the test database.
        /// </summary>
        /// <returns>The connection string.</returns>
        public string GetConnectionString() => _dbContainer.GetConnectionString();
    }
}
