using Fishio.SharedKernel.Exceptions;

namespace Fishio.IdentityAccess.Domain.Exceptions;

/// <summary>
/// Exception thrown when domain rules are violated in the IdentityAccess context
/// </summary>
public class UserDomainException : DomainException
{
    public UserDomainException(string message) : base(message)
    {
    }

    public UserDomainException(string message, Exception innerException) : base(message, innerException)
    {
    }

    /// <summary>
    /// Creates an exception for when a user with the given email already exists
    /// </summary>
    public static UserDomainException UserAlreadyExists(string email)
        => new($"Użytkownik z adresem email '{email}' już istnieje w systemie");

    /// <summary>
    /// Creates an exception for when a user with the given Clerk ID already exists
    /// </summary>
    public static UserDomainException UserWithClerkIdAlreadyExists(string clerkId)
        => new($"Użytkownik z Clerk ID '{clerkId}' już istnieje w systemie");

    /// <summary>
    /// Creates an exception for invalid birth date
    /// </summary>
    public static UserDomainException InvalidBirthDate(string reason)
        => new($"Nieprawidłowa data urodzenia: {reason}");

    /// <summary>
    /// Creates an exception for when user is not found
    /// </summary>
    public static UserDomainException UserNotFound(int userId)
        => new($"Nie znaleziono użytkownika o ID '{userId}'");

    /// <summary>
    /// Creates an exception for when user is not found by Clerk ID
    /// </summary>
    public static UserDomainException UserNotFoundByClerkId(string clerkId)
        => new($"Nie znaleziono użytkownika o Clerk ID '{clerkId}'");

    /// <summary>
    /// Creates an exception for when user is not found by email
    /// </summary>
    public static UserDomainException UserNotFoundByEmail(string email)
        => new($"Nie znaleziono użytkownika o adresie email '{email}'");
}