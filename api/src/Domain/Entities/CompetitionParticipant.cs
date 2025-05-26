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
}
