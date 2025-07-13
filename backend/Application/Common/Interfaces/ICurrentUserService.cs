using Fishio.Domain.Entities;

namespace Fishio.Application.Common.Interfaces;

public interface ICurrentUserService
{
    int? UserId { get; }
    string? ClerkId { get; }
    string? Email { get; }
    string? FirstName { get; }
    string? LastName { get; }
    bool IsAuthenticated { get; }

    Task<User?> GetCurrentUserAsync(CancellationToken cancellationToken = default);
    Task<User> GetRequiredUserAsync(CancellationToken cancellationToken = default);
    Task EnsureUserExistsAsync(CancellationToken cancellationToken = default);
}