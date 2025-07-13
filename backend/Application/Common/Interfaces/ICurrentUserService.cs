using Fishio.Domain.Entities;

namespace Fishio.Application.Common.Interfaces;

public interface ICurrentUserService
{
    // Only safe, claim-based properties (no DB calls)
    string? ClerkId { get; }
    string? Email { get; }
    string? FirstName { get; }
    string? LastName { get; }
    bool IsAuthenticated { get; }

    // Main method - ensures authenticated user exists in domain
    Task<User?> GetCurrentUserAsync(CancellationToken cancellationToken = default);

    // Alternative method that doesn't create user if not exists
    Task<User?> FindUserAsync(CancellationToken cancellationToken = default);

    // For logging/performance scenarios where we need just ID
    Task<int?> GetUserIdAsync(CancellationToken cancellationToken = default);
}