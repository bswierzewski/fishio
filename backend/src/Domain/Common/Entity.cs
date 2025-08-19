namespace Fishio.Domain.Common;

/// <summary>
/// Base entity class providing identity functionality
/// </summary>
/// <typeparam name="TId">Type of the entity identifier</typeparam>
public abstract class Entity<TId>
{
    /// <summary>
    /// Unique identifier for the entity
    /// </summary>
    public TId Id { get; protected set; } = default!;
}
