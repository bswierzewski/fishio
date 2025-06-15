namespace Fishio.Domain.Entities;

public class Competition : BaseAuditableEntity
{
    public string Name { get; private set; } = string.Empty;
    public DateTimeRange Schedule { get; private set; } = null!;
    public string? Rules { get; private set; }
    public CompetitionType Type { get; private set; }
    public CompetitionStatus Status { get; private set; }
    public string? ImageUrl { get; private set; }
    public string? ImagePublicId { get; private set; } // Cloudinary PublicId for image management
    public string ResultsToken { get; private set; } = string.Empty;

    public int OrganizerId { get; private set; }
    public virtual User Organizer { get; private set; } = null!;

    public int FisheryId { get; private set; }
    public virtual Fishery Fishery { get; private set; } = null!;

    private readonly List<CompetitionCategory> _categories = [];
    public virtual IReadOnlyCollection<CompetitionCategory> Categories => _categories.AsReadOnly();

    private readonly List<CompetitionParticipant> _participants = [];
    public virtual IReadOnlyCollection<CompetitionParticipant> Participants => _participants.AsReadOnly();

    private readonly List<CompetitionFishCatch> _fishCatches = [];
    public virtual IReadOnlyCollection<CompetitionFishCatch> FishCatches => _fishCatches.AsReadOnly();


    private Competition() { }

    public Competition(
        string name,
        DateTimeRange schedule,
        CompetitionType type,
        User organizer,
        Fishery fishery,
        string? rules = null,
        string? imageUrl = null,
        string? imagePublicId = null)
    {
        Guard.Against.NullOrWhiteSpace(name, nameof(name));
        Guard.Against.Null(schedule, nameof(schedule));
        Guard.Against.Null(organizer, nameof(organizer));
        Guard.Against.Null(fishery, nameof(fishery));

        Name = name;
        Schedule = schedule;
        Type = type;
        OrganizerId = organizer.Id;
        Organizer = organizer;
        FisheryId = fishery.Id;
        Fishery = fishery;
        Rules = rules;
        ImageUrl = imageUrl;
        ImagePublicId = imagePublicId;
        Status = CompetitionStatus.Draft;
        ResultsToken = Guid.NewGuid().ToString("N");

        // Automatycznie dodaj organizatora jako uczestnika z rolą Organizator
        _participants.Add(new CompetitionParticipant(this, organizer, ParticipantRole.Organizer, true));
    }

    public void UpdateDetails(
        string name,
        DateTimeRange schedule,
        CompetitionType type,
        Fishery fishery,
        string? rules,
        string? imageUrl,
        string? imagePublicId = null)
    {
        Guard.Against.NullOrWhiteSpace(name, nameof(name));
        Guard.Against.Null(schedule, nameof(schedule));
        Guard.Against.Null(fishery, nameof(fishery));
        // TODO: Dodać walidację, czy można modyfikować (np. status Draft lub AcceptingRegistrations)
        if (Status != CompetitionStatus.Draft && Status != CompetitionStatus.AcceptingRegistrations && Status != CompetitionStatus.Scheduled)
        {
            throw new InvalidOperationException("Szczegóły zawodów można zmieniać tylko w statusie Draft, AcceptingRegistrations lub Scheduled.");
        }

        Name = name;
        Schedule = schedule;
        Type = type;
        FisheryId = fishery.Id;
        Fishery = fishery;
        Rules = rules;
        ImageUrl = imageUrl;
        ImagePublicId = imagePublicId;
    }

    /// <summary>
    /// Clears the image URL and PublicId (for image removal scenarios)
    /// </summary>
    public void ClearImage()
    {
        ImageUrl = null;
        ImagePublicId = null;
    }

    /// <summary>
    /// Sets new image metadata
    /// </summary>
    public void SetImage(string imageUrl, string? imagePublicId = null)
    {
        Guard.Against.NullOrWhiteSpace(imageUrl, nameof(imageUrl));
        ImageUrl = imageUrl;
        ImagePublicId = imagePublicId;
    }

    // --- Zarządzanie Statusem ---
    public bool IsAcceptingRegistrations() => Status == CompetitionStatus.AcceptingRegistrations;
    public bool IsFinished() => Status == CompetitionStatus.Finished;
    public bool CanModifyDetails() => Status == CompetitionStatus.Draft || Status == CompetitionStatus.AcceptingRegistrations || Status == CompetitionStatus.Scheduled;




    public void OpenRegistrations()
    {
        Status = CompetitionStatus.AcceptingRegistrations;
        // AddDomainEvent(new CompetitionRegistrationsOpenedEvent(this));
    }


    public void ScheduleCompetition()
    {
        Status = CompetitionStatus.Scheduled;
    }

    public void ReopenRegistrations()
    {
        Status = CompetitionStatus.AcceptingRegistrations;
        // AddDomainEvent(new CompetitionRegistrationsReopenedEvent(this));
    }

    public void SetToDraft(string reason)
    {
        Guard.Against.NullOrWhiteSpace(reason, nameof(reason));
        Status = CompetitionStatus.Draft;
        // TODO: Zapisać powód przywrócenia do szkicu, np. w nowym polu `DraftReason`
        // AddDomainEvent(new CompetitionSetToDraftEvent(this, reason));
    }




    public void StartCompetition()
    {
        Status = CompetitionStatus.Ongoing;
        // AddDomainEvent(new CompetitionStartedEvent(this));
    }

    public void FinishCompetition()
    {
        Status = CompetitionStatus.Finished;
        // AddDomainEvent(new CompetitionFinishedEvent(this));
    }

    public void CancelCompetition(string reason)
    {
        Guard.Against.NullOrWhiteSpace(reason, nameof(reason));
        Status = CompetitionStatus.Cancelled;
        // TODO: Zapisać powód anulowania, np. w nowym polu `CancellationReason`
        // AddDomainEvent(new CompetitionCancelledEvent(this, reason));
    }

    // --- Zarządzanie Uczestnikami ---
    public CompetitionParticipant AddParticipant(User user, ParticipantRole role, bool addedByOrganizer)
    {
        if (Status != CompetitionStatus.AcceptingRegistrations && Type == CompetitionType.Public && !addedByOrganizer)
            throw new InvalidOperationException("Nie można dołączyć do zawodów, które nie akceptują zgłoszeń.");
        if (Status != CompetitionStatus.AcceptingRegistrations && Status != CompetitionStatus.Draft && Status != CompetitionStatus.Scheduled && addedByOrganizer)
            throw new InvalidOperationException("Organizator może dodawać uczestników tylko gdy zawody są w statusie Draft, AcceptingRegistrations lub Scheduled.");

        // Sprawdź czy użytkownik już ma tę rolę w tych zawodach
        if (_participants.Any(p => p.UserId == user.Id && p.Role == role))
            throw new InvalidOperationException($"Użytkownik '{user.Name}' już ma rolę {role} w tych zawodach.");

        var participant = new CompetitionParticipant(this, user, role, addedByOrganizer);
        _participants.Add(participant);
        // AddDomainEvent(new ParticipantAddedToCompetitionEvent(this, participant));
        return participant;
    }

    public CompetitionParticipant AddGuestParticipant(string guestName, ParticipantRole role, bool addedByOrganizer, string? guestIdentifier = null)
    {
        if (Status != CompetitionStatus.AcceptingRegistrations && Status != CompetitionStatus.Draft && Status != CompetitionStatus.Scheduled)
            throw new InvalidOperationException("Gości można dodawać tylko gdy zawody są w statusie Draft, AcceptingRegistrations lub Scheduled.");

        if (role != ParticipantRole.Competitor)
            throw new ArgumentException("Gość może mieć tylko rolę Competitor.", nameof(role));

        // Można dodać walidację unikalności GuestIdentifier, jeśli jest używany
        if (!string.IsNullOrWhiteSpace(guestIdentifier) && _participants.Any(p => p.GuestIdentifier == guestIdentifier))
            throw new InvalidOperationException($"Uczestnik-gość z identyfikatorem '{guestIdentifier}' już istnieje.");

        var guestParticipant = new CompetitionParticipant(this, guestName, role, addedByOrganizer, guestIdentifier);
        _participants.Add(guestParticipant);
        // AddDomainEvent(new ParticipantAddedToCompetitionEvent(this, guestParticipant));
        return guestParticipant;
    }

    public void RemoveParticipant(CompetitionParticipant participant)
    {
        Guard.Against.Null(participant, nameof(participant));
        if (Status != CompetitionStatus.Draft && Status != CompetitionStatus.AcceptingRegistrations && Status != CompetitionStatus.Scheduled)
            throw new InvalidOperationException("Uczestników można usuwać tylko przed rozpoczęciem zawodów (status Draft, AcceptingRegistrations, Scheduled).");

        if (participant.CompetitionId != Id)
            throw new ArgumentException("Uczestnik nie należy do tych zawodów.");

        if (participant.Role == ParticipantRole.Organizer && _participants.Count(p => p.Role == ParticipantRole.Organizer) == 1)
            throw new InvalidOperationException("Nie można usunąć jedynego organizatora zawodów.");

        // TODO: Rozważyć, co z połowami uczestnika, jeśli jakieś ma (choć przed startem nie powinien)
        _participants.Remove(participant);
        // AddDomainEvent(new ParticipantRemovedFromCompetitionEvent(this, participant));
    }

    public CompetitionParticipant AssignJudge(User user)
    {
        if (Status != CompetitionStatus.Draft && Status != CompetitionStatus.AcceptingRegistrations && Status != CompetitionStatus.Scheduled)
            throw new InvalidOperationException("Sędziów można przypisywać tylko przed rozpoczęciem zawodów.");

        // Sprawdź czy użytkownik już jest sędzią
        var existingJudgeParticipant = _participants.FirstOrDefault(p => p.UserId == user.Id && p.Role == ParticipantRole.Judge);
        if (existingJudgeParticipant != null)
            throw new InvalidOperationException($"Użytkownik '{user.Name}' jest już sędzią w tych zawodach.");

        // Dodaj nową rolę sędziego (użytkownik może mieć już inne role)
        var judgeParticipant = new CompetitionParticipant(this, user, ParticipantRole.Judge, true); // Sędzia dodany przez organizatora
        _participants.Add(judgeParticipant);
        // AddDomainEvent(new JudgeAssignedToCompetitionEvent(this, judgeParticipant));
        return judgeParticipant;
    }

    public void RemoveJudge(CompetitionParticipant judgeParticipant)
    {
        Guard.Against.Null(judgeParticipant, nameof(judgeParticipant));
        if (judgeParticipant.Role != ParticipantRole.Judge)
            throw new ArgumentException("Podany uczestnik nie jest sędzią.");
        if (Status != CompetitionStatus.Draft && Status != CompetitionStatus.AcceptingRegistrations && Status != CompetitionStatus.Scheduled)
            throw new InvalidOperationException("Sędziów można usuwać tylko przed rozpoczęciem zawodów.");

        // Usuń tylko rolę sędziego (użytkownik może mieć inne role)
        _participants.Remove(judgeParticipant);
        // AddDomainEvent(new JudgeRemovedFromCompetitionEvent(this, judgeParticipant));
    }


    // --- Zarządzanie Kategoriami ---
    public CompetitionCategory AddCategory(
        CategoryDefinition categoryDefinition,
        bool isPrimaryScoring,
        int sortOrder = 0,
        int maxWinnersToDisplay = 1,
        int? fishSpeciesId = null,
        string? customNameOverride = null,
        string? customDescriptionOverride = null)
    {
        if (!CanModifyDetails())
            throw new InvalidOperationException("Kategorie można dodawać/modyfikować tylko gdy zawody pozwalają na edycję szczegółów.");

        if (isPrimaryScoring && _categories.Any(c => c.IsPrimaryScoring && c.IsEnabled))
        {
            throw new InvalidOperationException("Może istnieć tylko jedna aktywna główna kategoria punktacyjna.");
        }

        var competitionCategory = new CompetitionCategory(
            this, categoryDefinition, isPrimaryScoring, sortOrder, maxWinnersToDisplay,
            fishSpeciesId, customNameOverride, customDescriptionOverride);
        _categories.Add(competitionCategory);
        // AddDomainEvent(new CategoryAddedToCompetitionEvent(this, competitionCategory));
        return competitionCategory;
    }

    public void RemoveCategory(CompetitionCategory category)
    {
        Guard.Against.Null(category, nameof(category));
        if (!CanModifyDetails())
            throw new InvalidOperationException("Kategorie można usuwać tylko gdy zawody pozwalają na edycję szczegółów.");

        if (category.CompetitionId != Id)
            throw new ArgumentException("Kategoria nie należy do tych zawodów.");

        _categories.Remove(category);
        // AddDomainEvent(new CategoryRemovedFromCompetitionEvent(this, category));
    }

    // --- Zarządzanie Połowami ---
    public CompetitionFishCatch RecordFishCatch(
        CompetitionParticipant participant,
        User judge,
        FishSpecies? fishSpecies,
        DateTimeOffset catchTime,
        FishLength? length = null,
        FishWeight? weight = null)
    {
        Guard.Against.Null(participant, nameof(participant));
        Guard.Against.Null(judge, nameof(judge));
        // FishSpecies is now optional - judges may not specify species for multiple fish catches
        // ImageUrl is now optional - judges may register catches without photos

        if (participant.CompetitionId != Id)
            throw new ArgumentException("Uczestnik nie należy do tych zawodów.", nameof(participant));
        if (participant.Role != ParticipantRole.Competitor)
            throw new ArgumentException("Połów można zarejestrować tylko dla zawodnika.", nameof(participant));

        var judgeAsParticipant = _participants.FirstOrDefault(p => p.UserId == judge.Id && (p.Role == ParticipantRole.Judge || p.Role == ParticipantRole.Organizer));
        if (judgeAsParticipant == null)
            throw new InvalidOperationException($"Użytkownik '{judge.Name}' nie jest sędzią ani organizatorem w tych zawodach lub nie ma uprawnień.");

        // Walidacja, czy przynajmniej jedna miara (długość/waga) jest podana, jeśli wymaga tego kategoria główna
        var primaryCategory = _categories.FirstOrDefault(c => c.IsPrimaryScoring && c.IsEnabled);
        if (primaryCategory != null)
        {
            var metric = primaryCategory.CategoryDefinition.Metric;
            if ((metric == CategoryMetric.LengthCm && length == null) ||
                (metric == CategoryMetric.WeightKg && weight == null))
            {
                // Można to złagodzić lub uczynić bardziej konfigurowalnym
                // throw new ArgumentException($"Dla głównej kategorii punktacyjnej ({metric}) wymagane jest podanie odpowiedniej miary (długość/waga).");
            }
        }
        if (length == null && weight == null)
        {
            // Można rozważyć, czy to zawsze błąd, czy np. liczy się tylko sztuka
            // throw new ArgumentException("Należy podać przynajmniej długość lub wagę ryby.");
        }


        var fishCatch = new CompetitionFishCatch(this, participant, judge, fishSpecies, catchTime, length, weight);
        _fishCatches.Add(fishCatch);
        // AddDomainEvent(new FishCatchRecordedEvent(this, fishCatch));
        return fishCatch;
    }

    // --- Zarządzanie Sektorami (uproszczone) ---
    /// <summary>
    /// Sprawdza czy zawody używają sektorów (czy jakikolwiek uczestnik ma przypisany sektor)
    /// </summary>
    public bool UsesSectors()
    {
        return _participants.Any(p => p.Role == ParticipantRole.Competitor &&
                                     p.Status == ParticipantStatus.Approved &&
                                     p.HasSectorAssignment());
    }

    /// <summary>
    /// Pobiera listę unikalnych sektorów z przypisanymi uczestnikami
    /// </summary>
    public IEnumerable<string> GetUsedSectors()
    {
        return _participants
            .Where(p => p.Role == ParticipantRole.Competitor &&
                       p.Status == ParticipantStatus.Approved &&
                       p.HasSectorAssignment())
            .Select(p => p.Sector!)
            .Distinct()
            .OrderBy(s => s);
    }

    /// <summary>
    /// Pobiera uczestników przypisanych do danego sektora
    /// </summary>
    public IEnumerable<CompetitionParticipant> GetParticipantsInSector(string sector)
    {
        return _participants
            .Where(p => p.Role == ParticipantRole.Competitor &&
                       p.Status == ParticipantStatus.Approved &&
                       p.Sector == sector);
    }

    /// <summary>
    /// Pobiera uczestników nieprzypisanych do żadnego sektora (dla zawodów z sektorami)
    /// </summary>
    public IEnumerable<CompetitionParticipant> GetParticipantsWithoutSector()
    {
        return _participants
            .Where(p => p.Role == ParticipantRole.Competitor &&
                       p.Status == ParticipantStatus.Approved &&
                       !p.HasSectorAssignment());
    }
}
