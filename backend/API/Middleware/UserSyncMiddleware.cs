using Fishio.Application.Common.Interfaces;

namespace Fishio.API.Middleware;

/// <summary>
/// Middleware to ensure that an authenticated user from Clerk
/// is provisioned or available as a domain user.
/// This should be placed after authentication middleware and before authorization or endpoint execution.
/// </summary>
public class UserSyncMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<UserSyncMiddleware> _logger;

    public UserSyncMiddleware(RequestDelegate next, ILogger<UserSyncMiddleware> logger)
    {
        _next = next ?? throw new ArgumentNullException(nameof(next));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task InvokeAsync(HttpContext context, ICurrentUserService currentUserService)
    {
        if (context.User?.Identity?.IsAuthenticated == true)
        {
            _logger.LogDebug("User is authenticated. Attempting to get current user for ClerkUserId: {ClerkUserId}", currentUserService.ClerkId);

            try
            {
                var user = await currentUserService.GetCurrentUserAsync(context.RequestAborted);

                if (user != null)
                {
                    _logger.LogDebug("Domain user {UserId} successfully retrieved or provisioned for ClerkUserId: {ClerkUserId}", user.Id, currentUserService.ClerkId);
                }
                else if (!string.IsNullOrEmpty(currentUserService.ClerkId))
                {
                    // User is authenticated but domain user couldn't be provisioned
                    _logger.LogWarning("Nie udało się pobrać lub utworzyć użytkownika domenowego dla ClerkUserId: {ClerkUserId}. Prawdopodobnie brakuje wymaganych danych w claims.", currentUserService.ClerkId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred during user provisioning for ClerkUserId: {ClerkUserId}.", currentUserService.ClerkId);

                // Allow global exception handler to deal with the error
                // In production, you might want to handle this differently based on your requirements
                throw;
            }
        }
        else
        {
            _logger.LogTrace("User is not authenticated. Skipping domain user provisioning.");
        }

        await _next(context);
    }
}