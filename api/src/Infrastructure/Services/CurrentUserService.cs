using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace Fishio.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IApplicationDbContext _dbContext;
    private readonly ILogger<CurrentUserService> _logger;
    private int? _cachedUserId;

    public CurrentUserService(
        IHttpContextAccessor httpContextAccessor,
        IApplicationDbContext dbContext,
        ILogger<CurrentUserService> logger)
    {
        _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public string? ClerkUserId
    {
        get
        {
            var principal = _httpContextAccessor.HttpContext?.User;
            // Clerk często używa claimu 'sub' jako głównego identyfikatora użytkownika.
            // ClaimTypes.NameIdentifier jest również standardowym miejscem.
            // Sprawdź dokumentację Clerk, który claim zawiera unikalne ID użytkownika.
            return principal?.FindFirst("sub")?.Value // Preferowany dla OpenID Connect
                   ?? principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
    }

    public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;

    public int? UserId => _cachedUserId;

    public void SetUserId(int userId)
    {
        _cachedUserId = userId;
    }

    public async Task<User?> GetOrProvisionDomainUserAsync(CancellationToken cancellationToken = default)
    {
        if (!IsAuthenticated)
        {
            _logger.LogDebug("User is not authenticated (JWT validation likely failed or token not present). Cannot get or provision domain user.");
            return null;
        }

        var currentClerkUserId = ClerkUserId;
        if (string.IsNullOrEmpty(currentClerkUserId))
        {
            _logger.LogWarning("User is authenticated via JWT, but ClerkUserId claim ('sub' or NameIdentifier) is missing or empty.");
            return null;
        }

        var domainUser = await _dbContext.Users
            .FirstOrDefaultAsync(u => u.ClerkUserId == currentClerkUserId, cancellationToken);

        if (domainUser != null)
        {
            SetUserId(domainUser.Id);
            _logger.LogDebug("Found existing domain user {DomainUserId} for ClerkUserId {ClerkUserId} (from JWT).", domainUser.Id, currentClerkUserId);
            return domainUser;
        }

        _logger.LogInformation("Domain user not found for ClerkUserId {ClerkUserId} (from JWT). Attempting JIT provisioning.", currentClerkUserId);

        var principal = _httpContextAccessor.HttpContext?.User;

        var userName = principal?.FindFirst(ClaimTypes.Name)?.Value
                       ?? principal?.FindFirst("name")?.Value ?? string.Empty;

        var userEmail = principal?.FindFirst(ClaimTypes.Email)?.Value
                        ?? principal?.FindFirst("email")?.Value ?? string.Empty;

        var imageUrl = principal?.FindFirst("imageUrl")?.Value;

        var newUser = new User(currentClerkUserId, userEmail, userName, imageUrl);

        try
        {
            _dbContext.Users.Add(newUser);
            await _dbContext.SaveChangesAsync(cancellationToken);

            SetUserId(newUser.Id);
            _logger.LogInformation("Successfully provisioned new domain user {DomainUserId} for ClerkUserId {ClerkUserId} (from JWT).", newUser.Id, currentClerkUserId);
            return newUser;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during JIT provisioning for ClerkUserId {ClerkUserId} (from JWT).", currentClerkUserId);
            return null;
        }
    }
}
