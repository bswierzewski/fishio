namespace Fishio.Application.Competitions.Commands.UpdateCompetition;

public class UpdateCompetitionCommand : IRequest<bool>
{
    public int Id { get; set; } // ID zawodów do aktualizacji
    public string Name { get; set; } = string.Empty;
    public DateTimeOffset StartTime { get; set; }
    public DateTimeOffset EndTime { get; set; }
    public int FisheryId { get; set; }
    public string? Rules { get; set; }
    public CompetitionType Type { get; set; }
    public string? ImageUrl { get; set; } // Nowy URL zdjęcia (opcjonalny)
    public string? ImagePublicId { get; set; } // Nowy PublicId zdjęcia (opcjonalny)
    public bool RemoveCurrentImage { get; set; } = false;

    // Na razie nie pozwalamy na zmianę kategorii przez ten endpoint,
    // to mogłaby być osobna, bardziej złożona operacja.
    // public int PrimaryScoringCategoryDefinitionId { get; set; }
    // public List<SpecialCategoryDefinitionCommandDto>? SpecialCategories { get; set; }
}

public class UpdateCompetitionCommandValidator : AbstractValidator<UpdateCompetitionCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly TimeProvider _timeProvider;

    public UpdateCompetitionCommandValidator(IApplicationDbContext context, TimeProvider timeProvider)
    {
        _context = context;
        _timeProvider = timeProvider;
        var now = _timeProvider.GetUtcNow();

        RuleFor(v => v.Id).NotEmpty();

        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Nazwa zawodów jest wymagana.")
            .MaximumLength(250).WithMessage("Nazwa zawodów nie może przekraczać 250 znaków.");
        // Można dodać walidację unikalności nazwy dla INNYCH zawodów

        RuleFor(v => v.StartTime)
            .NotEmpty().WithMessage("Czas rozpoczęcia jest wymagany.")
            // Przy aktualizacji, zawody mogły już minąć, ale nie powinny zaczynać się "bardziej w przeszłości"
            // Jeśli zawody jeszcze się nie rozpoczęły, powinny być w przyszłości
            .Must((cmd, startTime) => BeValidStartTime(cmd, startTime, now))
            .WithMessage("Nieprawidłowy czas rozpoczęcia.");


        RuleFor(v => v.EndTime)
            .NotEmpty().WithMessage("Czas zakończenia jest wymagany.")
            .GreaterThan(v => v.StartTime.AddMinutes(30))
            .WithMessage("Czas zakończenia musi być późniejszy niż czas rozpoczęcia (minimum o 30 minut).");

        RuleFor(v => v.FisheryId)
            .NotEmpty().WithMessage("ID łowiska jest wymagane.")
            .GreaterThan(0).WithMessage("Nieprawidłowe ID łowiska.")
            .MustAsync(FisheryMustExist).WithMessage("Wybrane łowisko nie istnieje.");

        RuleFor(v => v.Rules)
            .MaximumLength(10000).WithMessage("Regulamin nie może przekraczać 10000 znaków.");

        RuleFor(v => v.Type)
            .IsInEnum().WithMessage("Nieprawidłowy typ zawodów.");

        When(x => !string.IsNullOrEmpty(x.ImageUrl), () =>
        {
            RuleFor(x => x.ImageUrl)
                .Must(BeValidUrl).WithMessage("Nieprawidłowy URL zdjęcia.");
        });
    }

    private bool BeValidStartTime(UpdateCompetitionCommand cmd, DateTimeOffset startTime, DateTimeOffset now)
    {
        // Sprawdź, czy zawody istnieją i jaki mają status
        var competition = _context.Competitions.AsNoTracking().FirstOrDefault(c => c.Id == cmd.Id);
        if (competition == null) return true; // Handler to złapie jako NotFound

        // Jeśli zawody już trwają lub się zakończyły, nie można zmieniać czasu startu na wcześniejszy niż obecny start
        if (competition.Status == CompetitionStatus.Ongoing || competition.Status == CompetitionStatus.Finished)
        {
            return startTime >= competition.Schedule.Start;
        }
        // Jeśli zawody są planowane, nowy czas startu musi być w przyszłości
        return startTime > now.AddMinutes(5);
    }


    private async Task<bool> FisheryMustExist(int fisheryId, CancellationToken cancellationToken)
    {
        return await _context.Fisheries.AnyAsync(f => f.Id == fisheryId, cancellationToken);
    }

    private bool BeValidUrl(string? url)
    {
        if (string.IsNullOrEmpty(url)) return true;
        return Uri.TryCreate(url, UriKind.Absolute, out _);
    }
}
