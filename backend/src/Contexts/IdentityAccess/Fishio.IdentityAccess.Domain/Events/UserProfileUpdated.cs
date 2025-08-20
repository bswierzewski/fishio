using Fishio.SharedKernel;
using Fishio.IdentityAccess.Domain.Enums;

namespace Fishio.IdentityAccess.Domain.Events;

/// <summary>
/// Domain event raised when a user's profile information is updated
/// </summary>
public class UserProfileUpdated : DomainEvent
{
    public int UserId { get; }
    public string OldFullName { get; }
    public string NewFullName { get; }
    public DateTime OldBirthDate { get; }
    public DateTime NewBirthDate { get; }
    public Gender OldGender { get; }
    public Gender NewGender { get; }

    public UserProfileUpdated(
        int userId, 
        string oldFullName, 
        string newFullName, 
        DateTime oldBirthDate, 
        DateTime newBirthDate,
        Gender oldGender, 
        Gender newGender)
    {
        UserId = userId;
        OldFullName = oldFullName;
        NewFullName = newFullName;
        OldBirthDate = oldBirthDate;
        NewBirthDate = newBirthDate;
        OldGender = oldGender;
        NewGender = newGender;
    }
}