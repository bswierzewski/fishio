namespace Fishio.Domain.Common;

/// <summary>
/// Interface defining audit properties for entities
/// </summary>
public interface IAuditableEntity
{
    /// <summary>
    /// Date and time when the entity was created
    /// </summary>
    DateTimeOffset Created { get; set; }

    /// <summary>
    /// Identifier of the user who created the entity
    /// </summary>
    int? CreatedBy { get; set; }

    /// <summary>
    /// Date and time when the entity was last modified
    /// </summary>
    DateTimeOffset LastModified { get; set; }

    /// <summary>
    /// Identifier of the user who last modified the entity
    /// </summary>
    int? LastModifiedBy { get; set; }
}

/// <summary>
/// Base auditable entity class providing audit capabilities and identity
/// </summary>
/// <typeparam name="TId">Type of the entity identifier</typeparam>
public abstract class AuditableEntity<TId> : Entity<TId>, IAuditableEntity
{
    /// <summary>
    /// Date and time when the entity was created
    /// </summary>
    public DateTimeOffset Created { get; set; }

    /// <summary>
    /// Identifier of the user who created the entity
    /// </summary>
    public int? CreatedBy { get; set; }

    /// <summary>
    /// Date and time when the entity was last modified
    /// </summary>
    public DateTimeOffset LastModified { get; set; }

    /// <summary>
    /// Identifier of the user who last modified the entity
    /// </summary>
    public int? LastModifiedBy { get; set; }
}