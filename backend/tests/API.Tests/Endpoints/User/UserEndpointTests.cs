using System.Net;
using API.Tests.Common;
using Fishio.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Fishio.Application.Users.Queries.GetCurrentUser;
using System.Text.Json;
using System.Net.Http.Json;

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

        [Fact]
        public async Task AuthenticateClientCall_WithSpecificUser_Should_ReturnCorrectUserData()
        {
            // Arrange
            SetAuthorization();

            // Act
            var response = await HttpClient.GetAsync("/api/users/me");
            response.EnsureSuccessStatusCode();

            var userDto = await response.Content.ReadFromJsonAsync<UserDto>();

            // Assert
            userDto.Should().NotBeNull();
            userDto!.ClerkId.Should().Be("user_2wYRiRPEB1wuCn6XhnBCJz8EBjJ");
            userDto.Email.Should().Be("swierzewski.bartosz@gmail.com");
            userDto.FirstName.Should().Be("Bartosz");
            userDto.LastName.Should().Be("Świerzewski");
            userDto.FullName.Should().Be("Bartosz Świerzewski");
        }

        [Fact]
        public async Task AuthenticateClientCall_WithSpecificUser_Should_CreateUserWithCorrectData()
        {
            // Arrange
            SetAuthorization();

            // Act
            await HttpClient.GetAsync("/api/users/me");

            // Assert
            var userInDb = await DbContext.Users.FirstOrDefaultAsync(u => u.ClerkId == "user_2wYRiRPEB1wuCn6XhnBCJz8EBjJ");

            userInDb.Should().NotBeNull();
            userInDb!.Email.Should().Be("swierzewski.bartosz@gmail.com");
            userInDb.FirstName.Should().Be("Bartosz");
            userInDb.LastName.Should().Be("Świerzewski");
            userInDb.GetFullName().Should().Be("Bartosz Świerzewski");
        }
    }
}
