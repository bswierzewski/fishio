namespace Fishio.Domain.Common;

/// <summary>
/// Base class for value objects in Domain-Driven Design.
/// Value objects are immutable objects that are defined by their attributes rather than identity.
/// They implement equality based on all their properties and are replaceable.
/// </summary>
/// <remarks>
/// Key characteristics of Value Objects:
/// - Immutable: Once created, their state cannot be changed
/// - No Identity: Two value objects with the same values are considered equal
/// - Replaceable: Can be replaced with another instance having the same values
/// - Self-validating: Should validate their own invariants
/// 
/// Examples: Money, Address, DateRange, Email, Phone Number
/// 
/// Usage:
/// 1. Inherit from this class
/// 2. Make all properties read-only (private set or init-only)
/// 3. Implement GetEqualityComponents() to return all properties used for equality
/// 4. Add validation in constructor to ensure invariants
/// </remarks>
public abstract class ValueObject
{
    /// <summary>
    /// Compares two value objects for equality using overloaded == operator.
    /// Handles null values correctly and delegates to Equals method.
    /// </summary>
    /// <param name="left">First value object to compare</param>
    /// <param name="right">Second value object to compare</param>
    /// <returns>True if both objects are equal or both are null; otherwise false</returns>
    protected static bool EqualOperator(ValueObject left, ValueObject right)
    {
        if (left is null ^ right is null)
        {
            return false;
        }

        return left?.Equals(right!) != false;
    }

    /// <summary>
    /// Compares two value objects for inequality using overloaded != operator.
    /// </summary>
    /// <param name="left">First value object to compare</param>
    /// <param name="right">Second value object to compare</param>
    /// <returns>True if objects are not equal; otherwise false</returns>
    protected static bool NotEqualOperator(ValueObject left, ValueObject right)
    {
        return !EqualOperator(left, right);
    }

    /// <summary>
    /// Returns all components that participate in equality comparison.
    /// This method must be implemented by derived classes to return all properties
    /// that define the identity of the value object.
    /// </summary>
    /// <returns>Collection of objects used for equality comparison</returns>
    /// <example>
    /// For a Money value object:
    /// <code>
    /// protected override IEnumerable&lt;object&gt; GetEqualityComponents()
    /// {
    ///     yield return Amount;
    ///     yield return Currency;
    /// }
    /// </code>
    /// </example>
    protected abstract IEnumerable<object> GetEqualityComponents();

    /// <summary>
    /// Determines whether the specified object is equal to the current value object.
    /// Two value objects are equal if they are of the same type and all their
    /// equality components are equal.
    /// </summary>
    /// <param name="obj">Object to compare with current instance</param>
    /// <returns>True if objects are equal; otherwise false</returns>
    public override bool Equals(object? obj)
    {
        if (obj == null || obj.GetType() != GetType())
        {
            return false;
        }

        var other = (ValueObject)obj;
        return GetEqualityComponents().SequenceEqual(other.GetEqualityComponents());
    }

    /// <summary>
    /// Returns a hash code for the current value object.
    /// The hash code is calculated based on all equality components to ensure
    /// that equal objects have equal hash codes.
    /// </summary>
    /// <returns>Hash code for the current object</returns>
    public override int GetHashCode()
    {
        var hash = new HashCode();

        foreach (var component in GetEqualityComponents())
        {
            hash.Add(component);
        }

        return hash.ToHashCode();
    }
}