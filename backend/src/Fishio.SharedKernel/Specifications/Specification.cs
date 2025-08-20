using Fishio.SharedKernel.Interfaces;

namespace Fishio.SharedKernel.Specifications;

/// <summary>
/// Base implementation of the Specification pattern for composable business rules.
/// Specifications encapsulate business rules and can be combined using logical operators.
/// </summary>
/// <typeparam name="T">The type that this specification evaluates</typeparam>
/// <remarks>
/// Specification pattern benefits:
/// - Encapsulates business rules in reusable objects
/// - Composable using And, Or, Not operators
/// - Testable in isolation
/// - Improves code readability and maintainability
/// 
/// Usage examples:
/// var activeUser = new ActiveUserSpec();
/// var adultUser = new AdultUserSpec();
/// var eligibleUser = activeUser.And(adultUser);
/// </remarks>
public abstract class Specification<T> : ISpecification<T>
{
    /// <summary>
    /// Evaluates whether the given candidate satisfies this specification
    /// </summary>
    /// <param name="candidate">The object to evaluate</param>
    /// <returns>True if the candidate satisfies the specification; otherwise false</returns>
    public abstract bool IsSatisfiedBy(T candidate);

    /// <summary>
    /// Combines this specification with another using logical AND operator
    /// </summary>
    /// <param name="other">The specification to combine with</param>
    /// <returns>A new specification that is satisfied only when both specifications are satisfied</returns>
    public Specification<T> And(Specification<T> other)
    {
        return new AndSpecification<T>(this, other);
    }

    /// <summary>
    /// Combines this specification with another using logical OR operator
    /// </summary>
    /// <param name="other">The specification to combine with</param>
    /// <returns>A new specification that is satisfied when either specification is satisfied</returns>
    public Specification<T> Or(Specification<T> other)
    {
        return new OrSpecification<T>(this, other);
    }

    /// <summary>
    /// Creates a negation of this specification using logical NOT operator
    /// </summary>
    /// <returns>A new specification that is satisfied when this specification is not satisfied</returns>
    public Specification<T> Not()
    {
        return new NotSpecification<T>(this);
    }

    /// <summary>
    /// Implicit conversion to Func for LINQ compatibility
    /// </summary>
    /// <param name="specification">The specification to convert</param>
    public static implicit operator Func<T, bool>(Specification<T> specification)
    {
        return specification.IsSatisfiedBy;
    }

    #region Composite Specifications

    /// <summary>
    /// Internal specification that represents logical AND operation between two specifications
    /// </summary>
    private class AndSpecification<TItem> : Specification<TItem>
    {
        private readonly Specification<TItem> _left;
        private readonly Specification<TItem> _right;

        public AndSpecification(Specification<TItem> left, Specification<TItem> right)
        {
            _left = left ?? throw new ArgumentNullException(nameof(left));
            _right = right ?? throw new ArgumentNullException(nameof(right));
        }

        public override bool IsSatisfiedBy(TItem candidate)
        {
            return _left.IsSatisfiedBy(candidate) && _right.IsSatisfiedBy(candidate);
        }
    }

    /// <summary>
    /// Internal specification that represents logical OR operation between two specifications
    /// </summary>
    private class OrSpecification<TItem> : Specification<TItem>
    {
        private readonly Specification<TItem> _left;
        private readonly Specification<TItem> _right;

        public OrSpecification(Specification<TItem> left, Specification<TItem> right)
        {
            _left = left ?? throw new ArgumentNullException(nameof(left));
            _right = right ?? throw new ArgumentNullException(nameof(right));
        }

        public override bool IsSatisfiedBy(TItem candidate)
        {
            return _left.IsSatisfiedBy(candidate) || _right.IsSatisfiedBy(candidate);
        }
    }

    /// <summary>
    /// Internal specification that represents logical NOT operation on a specification
    /// </summary>
    private class NotSpecification<TItem> : Specification<TItem>
    {
        private readonly Specification<TItem> _specification;

        public NotSpecification(Specification<TItem> specification)
        {
            _specification = specification ?? throw new ArgumentNullException(nameof(specification));
        }

        public override bool IsSatisfiedBy(TItem candidate)
        {
            return !_specification.IsSatisfiedBy(candidate);
        }
    }

    #endregion
}