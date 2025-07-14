using Fishio.Domain.Common;
using Fishio.Domain.Enums;

namespace Fishio.Domain.Entities;

public class User : BaseAuditableEntity
{
    public string ClerkId { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;

    // Optional profile data for automatic qualification in rankings
    public DateTime? DateOfBirth { get; private set; }
    public Gender? Gender { get; private set; }

    // User roles
    public UserRole? Role { get; private set; }

    // Public profile data
    public string? ProfileDescription { get; private set; }
    public string? ProfilePictureUrl { get; private set; }

    // Account settings
    public bool NotificationsEnabled { get; private set; } = true;

    // Navigation properties for competitions, results, etc. will be added later
    // private readonly List<Competition> _organizedCompetitions = new();
    // private readonly List<CompetitionParticipant> _participations = new();

    public User(string clerkId, string email, string firstName, string lastName)
    {
        ClerkId = clerkId ?? throw new ArgumentNullException(nameof(clerkId));
        Email = email ?? throw new ArgumentNullException(nameof(email));
        FirstName = firstName ?? throw new ArgumentNullException(nameof(firstName));
        LastName = lastName ?? throw new ArgumentNullException(nameof(lastName));
    }

    public void UpdateProfile(string firstName, string lastName)
    {
        FirstName = firstName ?? throw new ArgumentNullException(nameof(firstName));
        LastName = lastName ?? throw new ArgumentNullException(nameof(lastName));
    }

    public void UpdateOptionalData(DateTime? dateOfBirth = null, Gender? gender = null)
    {
        DateOfBirth = dateOfBirth;
        Gender = gender;
    }

    public void UpdateProfileDescription(string? description)
    {
        ProfileDescription = description;
    }

    public void UpdateProfilePicture(string? pictureUrl)
    {
        ProfilePictureUrl = pictureUrl;
    }

    public void SetRole(UserRole role)
    {
        Role = role;
    }

    public void SetNotifications(bool enabled)
    {
        NotificationsEnabled = enabled;
    }

    public string GetFullName() => $"{FirstName} {LastName}";

    public bool IsOrganizer() => Role == UserRole.Organizer || Role == UserRole.Admin;

    public bool IsJudge() => Role == UserRole.Judge || Role == UserRole.Admin;

    public bool IsAdmin() => Role == UserRole.Admin;

    public int? GetAge()
    {
        if (DateOfBirth == null) return null;

        var today = DateTime.Today;
        var age = today.Year - DateOfBirth.Value.Year;

        if (DateOfBirth.Value.Date > today.AddYears(-age))
            age--;

        return age;
    }
}