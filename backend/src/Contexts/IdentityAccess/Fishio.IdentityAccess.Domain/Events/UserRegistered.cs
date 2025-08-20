using Fishio.SharedKernel;

namespace Fishio.IdentityAccess.Domain.Events;

/// <summary>
/// Domain event raised when a new user is registered in the system
/// </summary>
public class UserRegistered : DomainEvent
{
    public int UserId { get; }
    public string ClerkId { get; }
    public string Email { get; }
    public string FullName { get; }

    public UserRegistered(int userId, string clerkId, string email, string fullName)
    {
        UserId = userId;
        ClerkId = clerkId;
        Email = email;
        FullName = fullName;
    }
}