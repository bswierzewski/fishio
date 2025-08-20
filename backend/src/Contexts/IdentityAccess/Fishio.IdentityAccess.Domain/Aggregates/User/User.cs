using Fishio.SharedKernel;
using Fishio.IdentityAccess.Domain.Enums;

namespace Fishio.IdentityAccess.Domain.Aggregates.User;

/// <summary>
/// Represents a user in the system with identity and profile information.
/// This is an aggregate root for the user identity context.
/// </summary>
public class User : AggregateRoot<int>
{
    public string ClerkId { get; private set; } = string.Empty;
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public DateTime? BirthDate { get; private set; }
    public Gender? Gender { get; private set; }

    public User(string clerkId, string email, string firstName, string lastName)
    {
        ClerkId = clerkId ?? throw new ArgumentNullException(nameof(clerkId));
        Email = email ?? throw new ArgumentNullException(nameof(email));
        FirstName = firstName ?? throw new ArgumentNullException(nameof(firstName));
        LastName = lastName ?? throw new ArgumentNullException(nameof(lastName));
    }

    public string GetFullName() => $"{FirstName} {LastName}";

    /// <summary>
    /// Sets the user's birth date
    /// </summary>
    /// <param name="birthDate">The birth date to set</param>
    public void SetBirthDate(DateTime birthDate)
    {
        if (birthDate > DateTime.Today)
            throw new ArgumentException("Data urodzenia nie może być z przyszłości", nameof(birthDate));

        BirthDate = birthDate;
    }

    /// <summary>
    /// Sets the user's gender
    /// </summary>
    /// <param name="gender">The gender to set</param>
    public void SetGender(Gender gender)
    {
        Gender = gender;
    }

    /// <summary>
    /// Calculates the current age of the user based on their birth date
    /// </summary>
    /// <returns>The current age in years, or null if birth date is not set</returns>
    public int? GetAge()
    {
        if (!BirthDate.HasValue)
            return null;

        var today = DateTime.Today;
        var age = today.Year - BirthDate.Value.Year;
        
        if (BirthDate.Value.Date > today.AddYears(-age))
            age--;
            
        return age;
    }

    /// <summary>
    /// Checks if the user falls within a specific age range
    /// </summary>
    /// <param name="ageRange">The age range to check against</param>
    /// <returns>True if the user's age falls within the range, false otherwise</returns>
    public bool IsInAgeRange(AgeRange ageRange)
    {
        if (!BirthDate.HasValue)
            return false;

        return ageRange.Contains(BirthDate.Value);
    }
}