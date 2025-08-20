namespace Fishio.SharedKernel.Exceptions;

/// <summary>
/// Base exception class for all domain-related exceptions.
/// Represents violations of domain rules and business invariants.
/// </summary>
/// <remarks>
/// Domain exceptions should be used when:
/// - Business rules are violated
/// - Domain invariants are broken
/// - Invalid domain operations are attempted
/// 
/// Error messages should be in Polish for user-facing scenarios.
/// </remarks>
public abstract class DomainException : Exception
{
    /// <summary>
    /// Initializes a new instance of the DomainException class
    /// </summary>
    protected DomainException()
    {
    }

    /// <summary>
    /// Initializes a new instance of the DomainException class with a specified error message
    /// </summary>
    /// <param name="message">The message that describes the error (should be in Polish for user-facing scenarios)</param>
    protected DomainException(string message) : base(message)
    {
    }

    /// <summary>
    /// Initializes a new instance of the DomainException class with a specified error message and inner exception
    /// </summary>
    /// <param name="message">The message that describes the error (should be in Polish for user-facing scenarios)</param>
    /// <param name="innerException">The exception that is the cause of the current exception</param>
    protected DomainException(string message, Exception innerException) : base(message, innerException)
    {
    }
}