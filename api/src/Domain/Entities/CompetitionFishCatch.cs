namespace Fishio.Domain.Entities;

public class CompetitionFishCatch : BaseAuditableEntity
{
    public int CompetitionId { get; private set; }
    public virtual Competition Competition { get; private set; } = null!;

    public int ParticipantId { get; private set; }
    public virtual CompetitionParticipant Participant { get; private set; } = null!;

    public int JudgeId { get; private set; }
    public virtual User Judge { get; private set; } = null!;

    public int? FishSpeciesId { get; private set; }
    public virtual FishSpecies? FishSpecies { get; private set; }

    public FishLength? Length { get; private set; }
    public FishWeight? Weight { get; private set; }
    public DateTimeOffset CatchTime { get; private set; } = DateTimeOffset.UtcNow;

    private CompetitionFishCatch() { }

    // Konstruktor wewnętrzny, tworzenie przez Competition.RecordFishCatch
    internal CompetitionFishCatch(
        Competition competition,
        CompetitionParticipant participant,
        User judge,
        FishSpecies? fishSpecies,
        DateTimeOffset catchTime,
        FishLength? length = null,
        FishWeight? weight = null)
    {
        Guard.Against.Null(competition, nameof(competition));
        Guard.Against.Null(participant, nameof(participant));
        Guard.Against.Null(judge, nameof(judge));
        // FishSpecies is now optional - judges may not specify species for multiple fish catches
        Guard.Against.Default(catchTime, nameof(catchTime));

        // Remove time restriction - judges can register catches from paper records later

        CompetitionId = competition.Id;
        Competition = competition;
        ParticipantId = participant.Id;
        Participant = participant;
        JudgeId = judge.Id;
        Judge = judge;
        FishSpeciesId = fishSpecies?.Id;
        FishSpecies = fishSpecies;
        CatchTime = catchTime;
        Length = length;
        Weight = weight;
    }

    public bool CanBeModifiedBy(User user)
    {
        // Tylko sędzia, który zarejestrował połów, lub organizator może modyfikować (przykładowa reguła)
        // Oraz zawody nie mogą być zakończone
        if (Competition.IsFinished() || Competition.Status == CompetitionStatus.Cancelled) return false;

        bool isJudgeWhoRecorded = JudgeId == user.Id;
        bool isOrganizer = Competition.OrganizerId == user.Id;
        // Można dodać rolę administratora systemu

        return isJudgeWhoRecorded || isOrganizer;
    }

    public void UpdateMeasurements(FishLength? length, FishWeight? weight, User modifyingUser)
    {
        if (!CanBeModifiedBy(modifyingUser))
            throw new InvalidOperationException("Brak uprawnień do modyfikacji tego połowu lub zawody są zakończone.");

        // Dodatkowa walidacja, jeśli jest potrzebna
        // np. czy przynajmniej jedna miara jest podana, jeśli wymaga tego kategoria główna
        var primaryCategory = Competition.Categories.FirstOrDefault(c => c.IsPrimaryScoring && c.IsEnabled);
        if (primaryCategory != null)
        {
            var metric = primaryCategory.CategoryDefinition.Metric;
            if ((metric == CategoryMetric.LengthCm && length == null) ||
                (metric == CategoryMetric.WeightKg && weight == null))
            {
                // throw new ArgumentException($"Dla głównej kategorii punktacyjnej ({metric}) wymagane jest podanie odpowiedniej miary (długość/waga).");
            }
        }
        if (length == null && weight == null)
        {
            // throw new ArgumentException("Należy podać przynajmniej długość lub wagę ryby.");
        }


        Length = length;
        Weight = weight;
        // AddDomainEvent(new FishCatchMeasurementsUpdatedEvent(this, modifyingUser));
    }


}
