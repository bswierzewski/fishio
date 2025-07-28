using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Testcontainers.PostgreSql;

namespace API.Tests.Common
{
    public class TestWebAppFactory<TProgram, TDbContext> : WebApplicationFactory<TProgram>, IAsyncLifetime
        where TProgram : class
        where TDbContext : DbContext
    {
        private readonly PostgreSqlContainer _dbContainer;

        public TestWebAppFactory()
        {
            _dbContainer = new PostgreSqlBuilder()
                .WithImage("postgres:16")
                .WithCleanUp(true)
                .Build();
        }

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

        public async Task InitializeAsync()
        {
            await _dbContainer.StartAsync();
            using var scope = Services.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<TDbContext>();
            await dbContext.Database.MigrateAsync();
        }

        public new async Task DisposeAsync()
        {
            await _dbContainer.StopAsync();
            await _dbContainer.DisposeAsync();
            await base.DisposeAsync();
        }

        public string GetConnectionString() => _dbContainer.GetConnectionString();
    }
}
