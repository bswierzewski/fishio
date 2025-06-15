namespace Fishio.Domain.Entities;

/// <summary>
/// Represents a participant in a competition.
/// This can be a user or a guest.
/// The participant can have different roles such as competitor, judge, or organizer.
/// The participant can be added by the organizer or join on their own.
/// </summary>
public class CompetitionParticipant : BaseAuditableEntity
{
    public int CompetitionId { get; private set; }
    public virtual Competition Competition { get; private set; } = null!;

    public int? UserId { get; private set; }
    public virtual User? User { get; private set; }

    public string? GuestName { get; private set; }
    public string? GuestIdentifier { get; private set; }

    public ParticipantRole Role { get; private set; }
    public bool AddedByOrganizer { get; private set; }
    public ParticipantStatus Status { get; private set; }

    public string? Sector { get; private set; }
    public string? Stand { get; private set; }

    public virtual ICollection<CompetitionFishCatch> FishCatches { get; private set; } = [];

    // Prywatny konstruktor dla EF Core
    private CompetitionParticipant() { }

    // Konstruktor wewnętrzny, tworzenie przez Competition.AddParticipant
    internal CompetitionParticipant(Competition competition, User user, ParticipantRole role, bool addedByOrganizer)
    {
        Guard.Against.Null(competition, nameof(competition));
        Guard.Against.Null(user, nameof(user));

        CompetitionId = competition.Id;
        Competition = competition;
        UserId = user.Id;
        User = user;
        Role = role;
        AddedByOrganizer = addedByOrganizer;
        // If added by organizer, automatically approve; otherwise set as waiting
        Status = addedByOrganizer ? ParticipantStatus.Approved : ParticipantStatus.Waiting;
    }

    // Konstruktor wewnętrzny dla gości, tworzenie przez Competition.AddGuestParticipant
    internal CompetitionParticipant(Competition competition, string guestName, ParticipantRole role, bool addedByOrganizer, string? guestIdentifier = null)
    {
        Guard.Against.Null(competition, nameof(competition));
        Guard.Against.NullOrWhiteSpace(guestName, nameof(guestName));
        if (role != ParticipantRole.Competitor)
        {
            throw new ArgumentException("Goście mogą mieć tylko rolę Competitor.", nameof(role));
        }

        CompetitionId = competition.Id;
        Competition = competition;
        GuestName = guestName;
        GuestIdentifier = guestIdentifier;
        Role = role;
        AddedByOrganizer = addedByOrganizer;
        // If added by organizer, automatically approve; otherwise set as waiting
        Status = addedByOrganizer ? ParticipantStatus.Approved : ParticipantStatus.Waiting;
    }

    public void ChangeRole(ParticipantRole newRole, User assigningUser /* Można dodać logikę uprawnień */)
    {
        // TODO: Dodać walidację, czy assigningUser ma uprawnienia do zmiany roli
        // TODO: Dodać walidację, czy zmiana roli jest dozwolona (np. gość na sędziego)
        if (UserId == null && newRole != ParticipantRole.Competitor)
        {
            throw new InvalidOperationException("Gość może mieć tylko rolę Competitor.");
        }

        // Przykład: Sędzia nie może stać się zwykłym zawodnikiem, jeśli ma już zarejestrowane połowy jako sędzia
        // (lub odwrotnie, zawodnik sędzią, jeśli ma połowy jako zawodnik) - zależy od reguł.

        Role = newRole;
        // Można dodać zdarzenie domenowe: ParticipantRoleChangedEvent
    }

    public void Approve()
    {
        if (Status == ParticipantStatus.Approved)
        {
            throw new InvalidOperationException("Uczestnik jest już zatwierdzony.");
        }

        Status = ParticipantStatus.Approved;
        // Można dodać zdarzenie domenowe: ParticipantApprovedEvent
    }

    public void Reject()
    {
        if (Status == ParticipantStatus.Rejected)
        {
            throw new InvalidOperationException("Uczestnik jest już odrzucony.");
        }

        Status = ParticipantStatus.Rejected;
        // Można dodać zdarzenie domenowe: ParticipantRejectedEvent
    }

    public void AssignToSectorAndStand(string? sector, string? stand)
    {
        // Można dodać walidację czy Competition pozwala na zmiany
        // if (!Competition.CanModifyDetails() && Competition.Status != CompetitionStatus.Ongoing)
        //     throw new InvalidOperationException("Przypisanie do sektora/stanowiska możliwe tylko podczas edycji lub w trakcie zawodów.");

        Sector = string.IsNullOrWhiteSpace(sector) ? null : sector.Trim();
        Stand = string.IsNullOrWhiteSpace(stand) ? null : stand.Trim();
    }

    public void ClearSectorAndStand()
    {
        Sector = null;
        Stand = null;
    }

    /// <summary>
    /// Sprawdza czy uczestnik ma przypisany sektor
    /// </summary>
    public bool HasSectorAssignment()
    {
        return !string.IsNullOrWhiteSpace(Sector);
    }

    /// <summary>
    /// Sprawdza czy uczestnik ma przypisane stanowisko
    /// </summary>
    public bool HasStandAssignment()
    {
        return !string.IsNullOrWhiteSpace(Stand);
    }
}
