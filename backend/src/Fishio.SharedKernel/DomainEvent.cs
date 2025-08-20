using Fishio.SharedKernel.Interfaces;

namespace Fishio.SharedKernel;

/// <summary>
/// Base implementation for domain events providing common properties and behavior.
/// Domain events represent something important that happened in the domain.
/// </summary>
/// <remarks>
/// Key characteristics of Domain Events:
/// - Immutable: Once created, their state cannot be changed
/// - Descriptive: Use past tense names (UserRegistered, OrderPlaced)
/// - Contain only necessary data for event handlers
/// - Occur within aggregate boundaries
/// 
/// Examples: UserRegistered, CompetitionFinished, PaymentProcessed
/// </remarks>
public abstract class DomainEvent : IDomainEvent
{
    /// <summary>
    /// Gets the unique identifier for this event instance
    /// </summary>
    public Guid Id { get; } = Guid.NewGuid();

    /// <summary>
    /// Gets the date and time when the event occurred
    /// </summary>
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}