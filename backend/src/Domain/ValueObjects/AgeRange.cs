namespace Fishio.Domain.ValueObjects;

/// <summary>
/// Value object representing an age range with optional minimum and maximum age boundaries
/// </summary>
public class AgeRange : ValueObject
{
    /// <summary>
    /// Minimum age in the range (inclusive). Null means no lower bound
    /// </summary>
    public int? MinAge { get; private set; }
    
    /// <summary>
    /// Maximum age in the range (inclusive). Null means no upper bound
    /// </summary>
    public int? MaxAge { get; private set; }

    /// <summary>
    /// Initializes a new instance of the AgeRange class
    /// </summary>
    /// <param name="minAge">Minimum age (inclusive). Null for no lower bound</param>
    /// <param name="maxAge">Maximum age (inclusive). Null for no upper bound</param>
    /// <exception cref="ArgumentException">Thrown when age values are invalid</exception>
    public AgeRange(int? minAge = null, int? maxAge = null)
    {
        if (minAge.HasValue && minAge.Value < 0)
            throw new ArgumentException("Minimum age cannot be negative", nameof(minAge));

        if (maxAge.HasValue && maxAge.Value < 0)
            throw new ArgumentException("Maximum age cannot be negative", nameof(maxAge));

        if (minAge.HasValue && maxAge.HasValue && minAge.Value > maxAge.Value)
            throw new ArgumentException("Minimum age cannot be greater than maximum age");

        MinAge = minAge;
        MaxAge = maxAge;
    }

    /// <summary>
    /// Creates an age range for junior participants (typically under 18)
    /// </summary>
    public static AgeRange Junior => new(maxAge: 17);

    /// <summary>
    /// Creates an age range for senior participants (typically 55 and over)
    /// </summary>
    public static AgeRange Senior => new(minAge: 55);

    /// <summary>
    /// Creates an age range for adult participants (typically 18-54)
    /// </summary>
    public static AgeRange Adult => new(minAge: 18, maxAge: 54);

    /// <summary>
    /// Creates an age range for all ages
    /// </summary>
    public static AgeRange AllAges => new();

    /// <summary>
    /// Checks if a given age falls within this range
    /// </summary>
    /// <param name="age">Age to check</param>
    /// <returns>True if the age falls within the range, false otherwise</returns>
    public bool Contains(int age)
    {
        if (age < 0) return false;
        
        if (MinAge.HasValue && age < MinAge.Value) return false;
        if (MaxAge.HasValue && age > MaxAge.Value) return false;
        
        return true;
    }

    /// <summary>
    /// Checks if a given birth date results in an age that falls within this range
    /// </summary>
    /// <param name="birthDate">Birth date to calculate age from</param>
    /// <returns>True if the calculated age falls within the range, false otherwise</returns>
    public bool Contains(DateTime birthDate)
    {
        var age = CalculateAge(birthDate);
        return Contains(age);
    }

    /// <summary>
    /// Checks if a given birth date results in an age that falls within this range
    /// </summary>
    /// <param name="birthDate">Birth date to calculate age from</param>
    /// <returns>True if the calculated age falls within the range, false otherwise</returns>
    public bool Contains(DateOnly birthDate)
    {
        var age = CalculateAge(birthDate);
        return Contains(age);
    }

    /// <summary>
    /// Checks if this age range overlaps with another age range
    /// </summary>
    /// <param name="other">Other age range to check overlap with</param>
    /// <returns>True if the ranges overlap, false otherwise</returns>
    public bool Overlaps(AgeRange other)
    {
        var thisMin = MinAge ?? 0;
        var thisMax = MaxAge ?? int.MaxValue;
        var otherMin = other.MinAge ?? 0;
        var otherMax = other.MaxAge ?? int.MaxValue;

        return thisMin <= otherMax && thisMax >= otherMin;
    }

    /// <summary>
    /// Gets a descriptive name for the age range in Polish
    /// </summary>
    /// <returns>Polish description of the age range</returns>
    public string GetDescription()
    {
        if (MinAge.HasValue && MaxAge.HasValue)
        {
            if (MinAge.Value == MaxAge.Value)
                return $"{MinAge.Value} lat";
            else
                return $"{MinAge.Value}-{MaxAge.Value} lat";
        }
        else if (MinAge.HasValue)
            return $"{MinAge.Value}+ lat";
        else if (MaxAge.HasValue)
            return $"do {MaxAge.Value} lat";
        else
            return "wszystkie wieki";
    }

    /// <summary>
    /// Gets a short name for common age ranges in Polish
    /// </summary>
    /// <returns>Short Polish name for the age range</returns>
    public string GetShortName()
    {
        if (Equals(Junior)) return "Junior";
        if (Equals(Senior)) return "Senior";
        if (Equals(Adult)) return "Dorosły";
        if (Equals(AllAges)) return "Wszystkie";
        
        return GetDescription();
    }

    /// <summary>
    /// Calculates age from birth date as of today
    /// </summary>
    /// <param name="birthDate">Birth date to calculate age from</param>
    /// <returns>Age in years as of today</returns>
    private static int CalculateAge(DateTime birthDate)
    {
        var today = DateTime.Today;
        var age = today.Year - birthDate.Year;
        
        if (birthDate.Date > today.AddYears(-age))
            age--;
            
        return age;
    }

    /// <summary>
    /// Calculates age from birth date as of today
    /// </summary>
    /// <param name="birthDate">Birth date to calculate age from</param>
    /// <returns>Age in years as of today</returns>
    private static int CalculateAge(DateOnly birthDate)
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var age = today.Year - birthDate.Year;
        
        if (birthDate > today.AddYears(-age))
            age--;
            
        return age;
    }

    /// <summary>
    /// Gets the components used for equality comparison
    /// </summary>
    /// <returns>Enumerable of objects used in equality comparison</returns>
    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return MinAge ?? -1; // Use -1 to represent null for comparison
        yield return MaxAge ?? -1; // Use -1 to represent null for comparison
    }

    /// <summary>
    /// Returns a string representation of the age range
    /// </summary>
    /// <returns>String representation using the Polish description</returns>
    public override string ToString()
    {
        return GetDescription();
    }
}
