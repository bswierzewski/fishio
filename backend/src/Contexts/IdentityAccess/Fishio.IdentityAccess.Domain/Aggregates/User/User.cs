using Fishio.SharedKernel;
using Fishio.IdentityAccess.Domain.Enums;
using Fishio.IdentityAccess.Domain.Events;

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
    public DateTime BirthDate { get; private set; }
    public Gender Gender { get; private set; }

    private User() { } // EF Core constructor

    public User(string clerkId, string email, string firstName, string lastName, DateTime birthDate, Gender gender)
    {
        if (string.IsNullOrWhiteSpace(clerkId))
            throw new ArgumentException("ClerkId nie może być pusty", nameof(clerkId));
        
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email nie może być pusty", nameof(email));
            
        if (string.IsNullOrWhiteSpace(firstName))
            throw new ArgumentException("Imię nie może być puste", nameof(firstName));
            
        if (string.IsNullOrWhiteSpace(lastName))
            throw new ArgumentException("Nazwisko nie może być puste", nameof(lastName));

        ValidateBirthDate(birthDate);

        ClerkId = clerkId;
        Email = email.ToLowerInvariant();
        FirstName = firstName.Trim();
        LastName = lastName.Trim();
        BirthDate = birthDate.Date; // Only date part, no time
        Gender = gender;

        AddDomainEvent(new UserRegistered(Id, ClerkId, Email, GetFullName()));
    }

    public string GetFullName() => $"{FirstName} {LastName}";

    /// <summary>
    /// Updates the user's profile information
    /// </summary>
    /// <param name="firstName">New first name</param>
    /// <param name="lastName">New last name</param>
    /// <param name="birthDate">New birth date</param>
    /// <param name="gender">New gender</param>
    public void UpdateProfile(string firstName, string lastName, DateTime birthDate, Gender gender)
    {
        if (string.IsNullOrWhiteSpace(firstName))
            throw new ArgumentException("Imię nie może być puste", nameof(firstName));
            
        if (string.IsNullOrWhiteSpace(lastName))
            throw new ArgumentException("Nazwisko nie może być puste", nameof(lastName));

        ValidateBirthDate(birthDate);

        var oldName = GetFullName();
        var oldBirthDate = BirthDate;
        var oldGender = Gender;

        FirstName = firstName.Trim();
        LastName = lastName.Trim();
        BirthDate = birthDate.Date;
        Gender = gender;

        AddDomainEvent(new UserProfileUpdated(Id, oldName, GetFullName(), oldBirthDate, BirthDate, oldGender, Gender));
    }

    /// <summary>
    /// Calculates the current age of the user based on their birth date
    /// </summary>
    /// <returns>The current age in years</returns>
    public int GetAge() => GetAgeAt(DateTime.Today);

    /// <summary>
    /// Calculates the age of the user at a specific date
    /// </summary>
    /// <param name="atDate">Date to calculate age at</param>
    /// <returns>Age in years at the specified date</returns>
    public int GetAgeAt(DateTime atDate)
    {
        var age = atDate.Year - BirthDate.Year;
        
        if (BirthDate > atDate.AddYears(-age))
            age--;
            
        return age;
    }

    private static void ValidateBirthDate(DateTime birthDate)
    {
        if (birthDate > DateTime.Today)
            throw new ArgumentException("Data urodzenia nie może być z przyszłości");

        if (birthDate < DateTime.Today.AddYears(-120))
            throw new ArgumentException("Data urodzenia jest zbyt odległa (maksymalnie 120 lat wstecz)");
    }
}