using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Fishio.Application.Common.Interfaces;
using Fishio.Domain.Entities;

namespace Fishio.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IApplicationDbContext _dbContext;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor, IApplicationDbContext dbContext)
    {
        _httpContextAccessor = httpContextAccessor;
        _dbContext = dbContext;
    }

    public int? UserId => GetUserId();

    public string? ClerkId => GetClerkId();

    public string? Email => GetEmail();

    public string? FirstName => GetFirstName();

    public string? LastName => GetLastName();

    public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated == true;

    public async Task<User?> GetCurrentUserAsync(CancellationToken cancellationToken = default)
    {
        var clerkId = GetClerkId();
        if (string.IsNullOrEmpty(clerkId))
            return null;

        return await _dbContext.Users
            .FirstOrDefaultAsync(u => u.ClerkId == clerkId, cancellationToken);
    }

    public async Task<User> GetRequiredUserAsync(CancellationToken cancellationToken = default)
    {
        var user = await GetCurrentUserAsync(cancellationToken);
        if (user == null)
        {
            throw new UnauthorizedAccessException("Użytkownik nie jest zalogowany.");
        }

        return user;
    }

    public async Task EnsureUserExistsAsync(CancellationToken cancellationToken = default)
    {
        var clerkId = GetClerkId();
        if (string.IsNullOrEmpty(clerkId))
            return;

        var exists = await _dbContext.Users
            .AnyAsync(u => u.ClerkId == clerkId, cancellationToken);

        if (!exists)
        {
            // This should not happen if UserSyncMiddleware is working properly
            throw new InvalidOperationException("Użytkownik nie istnieje w bazie danych.");
        }
    }

    private int? GetUserId()
    {
        var clerkId = GetClerkId();
        if (string.IsNullOrEmpty(clerkId))
            return null;

        // This is a synchronous operation, but since we're in a web context
        // and the UserSyncMiddleware should ensure the user exists, this should be fast
        var user = _dbContext.Users
            .FirstOrDefault(u => u.ClerkId == clerkId);

        return user?.Id;
    }

    private string? GetClerkId()
    {
        return _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }

    private string? GetEmail()
    {
        return _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Email)?.Value;
    }

    private string? GetFirstName()
    {
        return _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.GivenName)?.Value;
    }

    private string? GetLastName()
    {
        return _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Surname)?.Value;
    }
}