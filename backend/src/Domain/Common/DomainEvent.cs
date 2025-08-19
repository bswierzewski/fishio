using MediatR;

namespace Fishio.Domain.Common;

/// <summary>
/// Interface defining contract for domain events in Domain-Driven Design
/// Extends MediatR's INotification for event handling capabilities
/// </summary>
public interface IDomainEvent : INotification
{
    /// <summary>
    /// Gets the date and time when the event occurred
    /// </summary>
    DateTime OccurredOn { get; }
    
    /// <summary>
    /// Gets the unique identifier for this event instance
    /// </summary>
    Guid EventId { get; }
}

/// <summary>
/// Base abstract class for domain events providing default implementation
/// </summary>
public abstract class DomainEvent : IDomainEvent
{
    /// <summary>
    /// Gets the UTC date and time when this event occurred
    /// </summary>
    public DateTime OccurredOn { get; private set; } = DateTime.UtcNow;
    
    /// <summary>
    /// Gets the unique identifier for this event instance
    /// </summary>
    public Guid EventId { get; private set; } = Guid.NewGuid();
}
