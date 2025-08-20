using MediatR;

namespace Fishio.SharedKernel.Interfaces;

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
    Guid Id { get; }
}