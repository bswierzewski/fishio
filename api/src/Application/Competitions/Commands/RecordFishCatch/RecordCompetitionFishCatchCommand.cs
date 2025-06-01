namespace Fishio.Application.Competitions.Commands.RecordFishCatch;

public class RecordCompetitionFishCatchCommand : IRequest<int> // Zwraca ID zarejestrowanego połowu
{
    public int CompetitionId { get; set; }
    public int ParticipantEntryId { get; set; } // ID wpisu CompetitionParticipant dla zawodnika
    public int FishSpeciesId { get; set; }
    public string ImageUrl { get; set; } = string.Empty; // URL zdjęcia jest wymagany
    public string? ImagePublicId { get; set; } // PublicId zdjęcia (opcjonalny)
    public DateTimeOffset CatchTime { get; set; } // Czas złowienia, ustawiany przez sędziego
    public decimal? LengthInCm { get; set; }
    public decimal? WeightInKg { get; set; }
    public string? Notes { get; set; } // Notatki sędziego
}

public class RecordCompetitionFishCatchCommandValidator : AbstractValidator<RecordCompetitionFishCatchCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly TimeProvider _timeProvider; // Do walidacji CatchTime

    public RecordCompetitionFishCatchCommandValidator(IApplicationDbContext context, TimeProvider timeProvider)
    {
        _context = context;
        _timeProvider = timeProvider;

        RuleFor(v => v.CompetitionId).NotEmpty();
        RuleFor(v => v.ParticipantEntryId).NotEmpty();

        RuleFor(v => v.FishSpeciesId)
            .NotEmpty().WithMessage("Gatunek ryby jest wymagany.")
            .GreaterThan(0).WithMessage("Nieprawidłowe ID gatunku ryby.")
            .MustAsync(FishSpeciesMustExist).WithMessage("Wybrany gatunek ryby nie istnieje.");

        RuleFor(x => x.ImageUrl)
            .NotEmpty().WithMessage("URL zdjęcia jest wymagany.")
            .Must(BeValidUrl).WithMessage("Nieprawidłowy URL zdjęcia.");

        RuleFor(v => v.CatchTime)
            .NotEmpty().WithMessage("Czas połowu jest wymagany.")
            .MustAsync(BeWithinCompetitionTime).WithMessage("Czas połowu musi mieścić się w czasie trwania zawodów.");

        When(x => x.LengthInCm.HasValue, () =>
        {
            RuleFor(x => x.LengthInCm)
                .GreaterThan(0).WithMessage("Długość musi być wartością dodatnią.")
                .LessThanOrEqualTo(500).WithMessage("Długość nie może przekraczać 500 cm.");
        });

        When(x => x.WeightInKg.HasValue, () =>
        {
            RuleFor(x => x.WeightInKg)
                .GreaterThan(0).WithMessage("Waga musi być wartością dodatnią.")
                .LessThanOrEqualTo(200).WithMessage("Waga nie może przekraczać 200 kg.");
        });

        RuleFor(x => x.Notes)
            .MaximumLength(2000).WithMessage("Notatki nie mogą przekraczać 2000 znaków.");

        RuleFor(x => x) // Walidacja na poziomie całego obiektu
            .Must(HaveAtLeastOneMeasurement)
            .WithMessage("Należy podać przynajmniej długość lub wagę ryby.");
    }

    private async Task<bool> FishSpeciesMustExist(int fishSpeciesId, CancellationToken cancellationToken)
    {
        return await _context.FishSpecies.AnyAsync(fs => fs.Id == fishSpeciesId, cancellationToken);
    }

    private bool BeValidUrl(string url)
    {
        return Uri.TryCreate(url, UriKind.Absolute, out _);
    }

    private async Task<bool> BeWithinCompetitionTime(RecordCompetitionFishCatchCommand command, DateTimeOffset catchTime, CancellationToken cancellationToken)
    {
        var competition = await _context.Competitions
            .AsNoTracking() // Nie potrzebujemy śledzić do walidacji
            .Select(c => new { c.Id, c.Schedule, c.Status }) // Pobierz tylko potrzebne pola
            .FirstOrDefaultAsync(c => c.Id == command.CompetitionId, cancellationToken);

        if (competition == null) return false; // Zawody nie istnieją

        // Czas połowu musi być w trakcie trwania zawodów
        // I zawody muszą być w statusie Ongoing
        return competition.Status == CompetitionStatus.Ongoing &&
               catchTime >= competition.Schedule.Start &&
               catchTime <= competition.Schedule.End;
    }
    private bool HaveAtLeastOneMeasurement(RecordCompetitionFishCatchCommand command)
    {
        return command.LengthInCm.HasValue || command.WeightInKg.HasValue;
    }
}
