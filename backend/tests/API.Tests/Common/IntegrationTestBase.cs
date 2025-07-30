using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Respawn;
using Npgsql;

namespace API.Tests.Common
{
    /// <summary>
    /// Base class for integration tests, providing a shared setup and teardown logic.
    /// It handles database cleaning, service scope management, and HTTP client configuration.
    /// </summary>
    /// <typeparam name="TProgram">The type of the entry point class of the application.</typeparam>
    /// <typeparam name="TDbContext">The type of the DbContext used by the application.</typeparam>
    [Collection("Sequential")]
    public abstract class IntegrationTestBase<TProgram, TDbContext> : IClassFixture<TestWebAppFactory<TProgram, TDbContext>>, IAsyncLifetime
        where TProgram : class
        where TDbContext : DbContext
    {
        protected readonly HttpClient HttpClient;
        private readonly TestWebAppFactory<TProgram, TDbContext> _factory;
        private IServiceScope _scope = null!;
        private Respawner? _respawner;

        /// <summary>
        /// Gets the application's DbContext, scoped to the current test.
        /// </summary>
        protected TDbContext DbContext => GetService<TDbContext>();

        /// <summary>
        /// Initializes a new instance of the <see cref="IntegrationTestBase{TProgram, TDbContext}"/> class.
        /// </summary>
        /// <param name="factory">The web application factory instance.</param>
        protected IntegrationTestBase(TestWebAppFactory<TProgram, TDbContext> factory)
        {
            _factory = factory;
            HttpClient = factory.CreateClient();
        }

        /// <summary>
        /// Initializes the test environment before each test runs. It ensures the database is clean
        /// and creates a new service scope for test isolation.
        /// </summary>
        public async Task InitializeAsync()
        {
            await EnsureRespawnerInitializedAsync();

            // Reset the database before each test
            await using (var conn = new NpgsqlConnection(_factory.GetConnectionString()))
            {
                await conn.OpenAsync();
                await _respawner!.ResetAsync(conn);
            }

            // Create a new scope for each test to ensure service isolation
            _scope = _factory.Services.CreateScope();
        }

        /// <summary>
        /// Cleans up the environment after each test runs by disposing the service scope.
        /// </summary>
        public Task DisposeAsync()
        {
            // Clean up the scope after the test is finished
            _scope?.Dispose();
            return Task.CompletedTask;
        }

        private async Task EnsureRespawnerInitializedAsync()
        {
            if (_respawner is null)
            {
                await using var conn = new NpgsqlConnection(_factory.GetConnectionString());
                await conn.OpenAsync();
                _respawner = await Respawner.CreateAsync(conn, new RespawnerOptions
                {
                    DbAdapter = DbAdapter.Postgres,
                    SchemasToInclude = ["public"],
                    TablesToIgnore = ["__EFMigrationsHistory"]
                });
            }
        }

        #region Helper Methods

        /// <summary>
        /// Gets a required service from the dependency injection container within the current test's scope.
        /// </summary>
        /// <typeparam name="T">The type of the service to retrieve.</typeparam>
        /// <returns>An instance of the requested service.</returns>
        protected T GetService<T>() where T : notnull
        {
            return _scope.ServiceProvider.GetRequiredService<T>();
        }

        /// <summary>
        /// Sets the authorization header for the HTTP client.
        /// </summary>
        protected void SetAuthorization()
        {
            var configuration = GetService<IConfiguration>();
            var token = configuration["JWT"] ?? throw new InvalidOperationException("JWT token not found in configuration.");
            HttpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

        #endregion
    }
}
