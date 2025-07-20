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

    public string? ClerkId => _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    public string? Email => _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Email)?.Value;

    public string? FirstName => _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.GivenName)?.Value;

    public string? LastName => _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Surname)?.Value;

    public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated == true;

    public async Task<User?> GetCurrentUserAsync(CancellationToken cancellationToken = default)
    {
        var clerkId = ClerkId;
        if (string.IsNullOrEmpty(clerkId))
            return null;

        var user = await _dbContext.Users
            .FirstOrDefaultAsync(u => u.ClerkId == clerkId, cancellationToken);

        if (user == null)
        {
            var email = Email;
            var firstName = FirstName;
            var lastName = LastName;

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(firstName) || string.IsNullOrEmpty(lastName))
                return null; // Incomplete user claims

            user = new User(clerkId, email, firstName, lastName);
            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        return user;
    }

    public async Task<User?> FindUserAsync(CancellationToken cancellationToken = default)
    {
        var clerkId = ClerkId;
        if (string.IsNullOrEmpty(clerkId))
            return null;

        return await _dbContext.Users
            .FirstOrDefaultAsync(u => u.ClerkId == clerkId, cancellationToken);
    }

    public async Task<int?> GetUserIdAsync(CancellationToken cancellationToken = default)
    {
        var user = await FindUserAsync(cancellationToken);
        return user?.Id;
    }
}