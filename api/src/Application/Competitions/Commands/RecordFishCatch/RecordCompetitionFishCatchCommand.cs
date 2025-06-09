namespace Fishio.Application.Competitions.Commands.RecordFishCatch;

public class RecordCompetitionFishCatchCommand : IRequest<int> // Zwraca ID zarejestrowanego połowu
{
    public int CompetitionId { get; set; }
    public int ParticipantEntryId { get; set; } // ID wpisu CompetitionParticipant dla zawodnika
    public int? FishSpeciesId { get; set; }
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

        When(x => x.FishSpeciesId.HasValue, () =>
        {
            RuleFor(v => v.FishSpeciesId)
                .GreaterThan(0).WithMessage("Nieprawidłowe ID gatunku ryby.")
                .MustAsync(FishSpeciesMustExist).WithMessage("Wybrany gatunek ryby nie istnieje.");
        });

        RuleFor(v => v.CatchTime)
            .NotEmpty().WithMessage("Czas połowu jest wymagany.");

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

    private async Task<bool> FishSpeciesMustExist(int? fishSpeciesId, CancellationToken cancellationToken)
    {
        if (!fishSpeciesId.HasValue) return true; // null is valid
        return await _context.FishSpecies.AnyAsync(fs => fs.Id == fishSpeciesId.Value, cancellationToken);
    }


    private bool HaveAtLeastOneMeasurement(RecordCompetitionFishCatchCommand command)
    {
        return command.LengthInCm.HasValue || command.WeightInKg.HasValue;
    }
}
