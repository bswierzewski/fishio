using Fishio.Domain.Common;

namespace Fishio.Domain.Entities;

public class User : BaseAuditableEntity
{
    public string ClerkId { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;

    public User(string clerkId, string email, string firstName, string lastName)
    {
        ClerkId = clerkId ?? throw new ArgumentNullException(nameof(clerkId));
        Email = email ?? throw new ArgumentNullException(nameof(email));
        FirstName = firstName ?? throw new ArgumentNullException(nameof(firstName));
        LastName = lastName ?? throw new ArgumentNullException(nameof(lastName));
    }

    public string GetFullName() => $"{FirstName} {LastName}";
}