namespace Fishio.SharedKernel.Exceptions;

/// <summary>
/// Exception thrown when a business rule is violated in the domain.
/// This exception indicates that an operation violates established business rules.
/// </summary>
/// <remarks>
/// Use this exception when:
/// - A business rule is explicitly violated
/// - Domain operations are performed in invalid business contexts
/// - Business constraints are not met
/// 
/// Examples:
/// - Registering for a competition after deadline
/// - Adding a catch with invalid weight/length
/// - Creating a team with insufficient members
/// </remarks>
public class BusinessRuleViolationException : DomainException
{
    /// <summary>
    /// Gets the name of the business rule that was violated
    /// </summary>
    public string RuleName { get; }

    /// <summary>
    /// Initializes a new instance of BusinessRuleViolationException
    /// </summary>
    /// <param name="ruleName">The name of the violated business rule</param>
    /// <param name="message">The error message in Polish describing the violation</param>
    public BusinessRuleViolationException(string ruleName, string message) : base(message)
    {
        RuleName = ruleName ?? throw new ArgumentNullException(nameof(ruleName));
    }

    /// <summary>
    /// Initializes a new instance of BusinessRuleViolationException with inner exception
    /// </summary>
    /// <param name="ruleName">The name of the violated business rule</param>
    /// <param name="message">The error message in Polish describing the violation</param>
    /// <param name="innerException">The exception that caused this violation</param>
    public BusinessRuleViolationException(string ruleName, string message, Exception innerException) 
        : base(message, innerException)
    {
        RuleName = ruleName ?? throw new ArgumentNullException(nameof(ruleName));
    }
}