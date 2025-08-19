using System.ComponentModel.DataAnnotations.Schema;

namespace Fishio.Domain.Common;

/// <summary>
/// Interface defining contract for aggregate roots in Domain-Driven Design
/// </summary>
public interface IAggregateRoot
{
    /// <summary>
    /// Gets the collection of domain events associated with this aggregate
    /// </summary>
    IReadOnlyCollection<IDomainEvent> DomainEvents { get; }
    
    /// <summary>
    /// Adds a domain event to the aggregate's event collection
    /// </summary>
    /// <param name="domainEvent">Domain event to add</param>
    void AddDomainEvent(IDomainEvent domainEvent);
    
    /// <summary>
    /// Removes a specific domain event from the aggregate's event collection
    /// </summary>
    /// <param name="domainEvent">Domain event to remove</param>
    void RemoveDomainEvent(IDomainEvent domainEvent);
    
    /// <summary>
    /// Clears all domain events from the aggregate's event collection
    /// </summary>
    void ClearDomainEvents();
}

/// <summary>
/// Base aggregate root class providing domain events functionality
/// </summary>
/// <typeparam name="TId">Type of the entity identifier</typeparam>
public abstract class AggregateRoot<TId> : AuditableEntity<TId>, IAggregateRoot
{
    /// <summary>
    /// Private collection storing domain events for this aggregate
    /// </summary>
    private readonly List<IDomainEvent> _domainEvents = new();

    /// <summary>
    /// Gets the read-only collection of domain events. NotMapped to exclude from database persistence
    /// </summary>
    [NotMapped]
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    /// <summary>
    /// Adds a domain event to the aggregate's event collection
    /// </summary>
    /// <param name="domainEvent">Domain event to add</param>
    public void AddDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    /// <summary>
    /// Removes a specific domain event from the aggregate's event collection
    /// </summary>
    /// <param name="domainEvent">Domain event to remove</param>
    public void RemoveDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Remove(domainEvent);
    }

    /// <summary>
    /// Clears all domain events from the aggregate's event collection
    /// </summary>
    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }
}
