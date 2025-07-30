using System.Net;
using API.Tests.Common;
using Fishio.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace API.Tests.Endpoints.User
{
    public class UserEndpointTests : IntegrationTestBase<Program, ApplicationDbContext>
    {
        public UserEndpointTests(TestWebAppFactory<Program, ApplicationDbContext> factory) : base(factory) { }

        [Fact]
        public async Task UnAuthenticateClientCall_Should_Response401()
        {
            // Act
            var response = await HttpClient.GetAsync("/api/users/me");
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task AuthenticateClientCall_Should_CreateUser()
        {
            // Arrange
            SetAuthorization();
            var initialCount = await DbContext.Users.CountAsync();

            // Act
            var response = await HttpClient.GetAsync("/api/users/me");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var finalCount = await DbContext.Users.CountAsync();

            initialCount.Should().Be(0);
            finalCount.Should().Be(1);
        }
    }
}
