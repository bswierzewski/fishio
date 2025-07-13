using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Fishio.Application.Common.Interfaces;
using Fishio.Domain.Entities;

namespace Fishio.API.Middleware;

public class UserSyncMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<UserSyncMiddleware> _logger;

    public UserSyncMiddleware(RequestDelegate next, ILogger<UserSyncMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, IApplicationDbContext dbContext)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            try
            {
                await EnsureUserExistsAsync(context, dbContext);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error synchronizing user with database");
                // Continue execution even if user sync fails
            }
        }

        await _next(context);
    }

    private async Task EnsureUserExistsAsync(HttpContext context, IApplicationDbContext dbContext)
    {
        var clerkId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(clerkId))
        {
            _logger.LogWarning("User is authenticated but ClerkId is missing");
            return;
        }

        var existingUser = await dbContext.Users
            .FirstOrDefaultAsync(u => u.ClerkId == clerkId);

        if (existingUser == null)
        {
            var email = context.User.FindFirst(ClaimTypes.Email)?.Value;
            var firstName = context.User.FindFirst(ClaimTypes.GivenName)?.Value;
            var lastName = context.User.FindFirst(ClaimTypes.Surname)?.Value;

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(firstName) || string.IsNullOrEmpty(lastName))
            {
                _logger.LogWarning("User claims are incomplete: Email={Email}, FirstName={FirstName}, LastName={LastName}",
                    email, firstName, lastName);
                return;
            }

            var newUser = new User(clerkId, email, firstName, lastName);

            dbContext.Users.Add(newUser);
            await dbContext.SaveChangesAsync();

            _logger.LogInformation("Created new user with ClerkId: {ClerkId}", clerkId);
        }
        else
        {
            // Update user information if it has changed
            var currentEmail = context.User.FindFirst(ClaimTypes.Email)?.Value;
            var currentFirstName = context.User.FindFirst(ClaimTypes.GivenName)?.Value;
            var currentLastName = context.User.FindFirst(ClaimTypes.Surname)?.Value;

            if (!string.IsNullOrEmpty(currentEmail) && existingUser.Email != currentEmail)
            {
                // Email update would require more complex logic due to unique constraint
                _logger.LogWarning("Email change detected for user {ClerkId}. Manual intervention may be required.", clerkId);
            }

            if (!string.IsNullOrEmpty(currentFirstName) && !string.IsNullOrEmpty(currentLastName) &&
                (existingUser.FirstName != currentFirstName || existingUser.LastName != currentLastName))
            {
                existingUser.UpdateProfile(currentFirstName, currentLastName, existingUser.City, existingUser.Province);
                await dbContext.SaveChangesAsync();

                _logger.LogInformation("Updated user profile for ClerkId: {ClerkId}", clerkId);
            }
        }
    }
}