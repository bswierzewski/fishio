using System.Net.Http.Headers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Respawn;
using Npgsql;

namespace API.Tests.Common
{
    [Collection("Sequential")]
    public abstract class IntegrationTestBase<TProgram, TDbContext> : IClassFixture<TestWebAppFactory<TProgram, TDbContext>>, IAsyncLifetime
        where TProgram : class
        where TDbContext : DbContext
    {
        protected readonly HttpClient HttpClient;
        private readonly Func<Task> _resetDatabase;
        private readonly TestWebAppFactory<TProgram, TDbContext> _factory;
        private IServiceScope _scope = null!;

        // DbContext jest teraz właściwością, a nie polem, aby pobierać go ze świeżego scope'a
        protected TDbContext DbContext => GetService<TDbContext>();

        protected IntegrationTestBase(TestWebAppFactory<TProgram, TDbContext> factory)
        {
            _factory = factory;
            HttpClient = factory.CreateClient();

            // Konfiguracja Respawn pozostaje bez zmian
            _resetDatabase = async () =>
            {
                var connectionString = factory.GetConnectionString();

                // Używamy NpgsqlConnection do połączenia z bazą danych
                await using var connection = new NpgsqlConnection(connectionString);

                // Otwieramy połączenie asynchronicznie
                await connection.OpenAsync();

                // Tworzymy instancję Respawn, przekazujemy otwarty obiekt połaczenia
                var respawner = await Respawner.CreateAsync(connection, new RespawnerOptions
                {
                    DbAdapter = DbAdapter.Postgres,
                    SchemasToInclude = ["public"],
                    TablesToIgnore = ["__EFMigrationsHistory"]
                });

                // Resetujemy bazę danych
                await respawner.ResetAsync(connection);
            };
        }

        // Uruchamiane przed każdym testem
        public async Task InitializeAsync()
        {
            await _resetDatabase();
            // Tworzymy nowy scope dla każdego testu, aby zapewnić izolację serwisów
            _scope = _factory.Services.CreateScope();
        }

        // Uruchamiane po każdym teście
        public Task DisposeAsync()
        {
            // Czyścimy scope po zakończeniu testu
            _scope?.Dispose();
            return Task.CompletedTask;
        }

        #region Helper Methods

        /// </summary>
        /// <typeparam name="T">Typ serwisu do pobrania.</typeparam>
        /// <returns>Instancja serwisu.</returns>
        protected T GetService<T>() where T : notnull
        {
            return _scope.ServiceProvider.GetRequiredService<T>();
        }

        protected void AuthenticateClient(string token)
        {
            HttpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

        protected void ClearAuthentication()
        {
            HttpClient.DefaultRequestHeaders.Authorization = null;
        }

        #endregion
    }
}
