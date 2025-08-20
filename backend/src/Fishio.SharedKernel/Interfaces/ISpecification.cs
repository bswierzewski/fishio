namespace Fishio.SharedKernel.Interfaces;

/// <summary>
/// Interface for specification pattern implementation.
/// Specifications encapsulate business rules and can be composed using logical operators.
/// </summary>
/// <typeparam name="T">The type that this specification evaluates</typeparam>
public interface ISpecification<T>
{
    /// <summary>
    /// Evaluates whether the given candidate satisfies this specification
    /// </summary>
    /// <param name="candidate">The object to evaluate</param>
    /// <returns>True if the candidate satisfies the specification; otherwise false</returns>
    bool IsSatisfiedBy(T candidate);
}