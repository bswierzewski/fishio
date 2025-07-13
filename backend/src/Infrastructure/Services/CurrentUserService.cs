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

        var existingUser = await _dbContext.Users
            .FirstOrDefaultAsync(u => u.ClerkId == clerkId, cancellationToken);

        if (existingUser == null)
        {
            var email = GetEmail();
            var firstName = GetFirstName();
            var lastName = GetLastName();

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(firstName) || string.IsNullOrEmpty(lastName))
                return null; // Incomplete user claims

            var newUser = new User(clerkId, email, firstName, lastName);
            _dbContext.Users.Add(newUser);
            await _dbContext.SaveChangesAsync(cancellationToken);

            return newUser;
        }

        // Update user information if it has changed
        var currentEmail = GetEmail();
        var currentFirstName = GetFirstName();
        var currentLastName = GetLastName();

        if (!string.IsNullOrEmpty(currentFirstName) && !string.IsNullOrEmpty(currentLastName) &&
            (existingUser.FirstName != currentFirstName || existingUser.LastName != currentLastName))
        {
            existingUser.UpdateProfile(currentFirstName, currentLastName);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        return existingUser;
    }

    public async Task<User?> FindUserAsync(CancellationToken cancellationToken = default)
    {
        var clerkId = GetClerkId();
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