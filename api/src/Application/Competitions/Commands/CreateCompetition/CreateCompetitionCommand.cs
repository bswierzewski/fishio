namespace Fishio.Application.Competitions.Commands.CreateCompetition;

public class CreateCompetitionCommand : IRequest<int> // Zwraca ID nowych zawodów
{
    public string Name { get; set; } = string.Empty;
    public DateTimeOffset StartTime { get; set; }
    public DateTimeOffset EndTime { get; set; }
    public int FisheryId { get; set; } // Lokalizacja będzie pobierana z łowiska
    public string? Rules { get; set; }
    public CompetitionType Type { get; set; } // Otwarte (Public) lub Zamknięte (Private)
    public string? ImageUrl { get; set; } // Opcjonalne zdjęcie zawodów
    public string? ImagePublicId { get; set; }

    // Kategorie
    public int PrimaryScoringCategoryDefinitionId { get; set; } // ID definicji głównej kategorii
    public int? PrimaryScoringFishSpeciesId { get; set; } // Opcjonalne ID gatunku dla głównej kategorii

    public List<SpecialCategoryDefinitionCommandDto>? SpecialCategories { get; set; }
}

public class SpecialCategoryDefinitionCommandDto
{
    public int CategoryDefinitionId { get; set; }
    public int? FishSpeciesId { get; set; } // Opcjonalne ID gatunku dla kategorii specjalnej
    public string? CustomNameOverride { get; set; }
    // Można dodać inne pola do konfiguracji kategorii specjalnej, jeśli potrzebne
}


public class CreateCompetitionCommandValidator : AbstractValidator<CreateCompetitionCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly TimeProvider _timeProvider;

    public CreateCompetitionCommandValidator(IApplicationDbContext context, TimeProvider timeProvider)
    {
        _context = context;
        _timeProvider = timeProvider;

        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Nazwa zawodów jest wymagana.")
            .MaximumLength(255).WithMessage("Nazwa zawodów nie może przekraczać 255 znaków.");

        RuleFor(v => v.StartTime)
            .Must(BeInFuture).WithMessage("Czas rozpoczęcia musi być w przyszłości.");

        RuleFor(v => v.EndTime)
            .GreaterThan(v => v.StartTime).WithMessage("Czas zakończenia musi być późniejszy niż czas rozpoczęcia.");

        RuleFor(v => v.FisheryId)
            .NotEmpty().WithMessage("ID łowiska jest wymagane.")
            .MustAsync(FisheryMustExist).WithMessage("Wybrane łowisko nie istnieje.");

        RuleFor(v => v.Rules)
            .MaximumLength(5000).WithMessage("Regulamin nie może przekraczać 5000 znaków.");

        RuleFor(v => v.Type)
            .IsInEnum().WithMessage("Nieprawidłowy typ zawodów.");

        RuleFor(v => v.PrimaryScoringCategoryDefinitionId)
            .NotEmpty().WithMessage("Główna kategoria punktacji jest wymagana.")
            .MustAsync(CategoryDefinitionMustExist).WithMessage("Wybrana definicja kategorii nie istnieje.");

        When(v => v.PrimaryScoringFishSpeciesId.HasValue, () =>
        {
            RuleFor(v => v.PrimaryScoringFishSpeciesId)
                .MustAsync(FishSpeciesMustExist).WithMessage("Wybrany gatunek ryby nie istnieje.");
        });

        When(x => !string.IsNullOrEmpty(x.ImageUrl), () =>
        {
            RuleFor(x => x.ImageUrl)
                .Must(BeValidUrl).WithMessage("Nieprawidłowy URL zdjęcia.");
        });

        // Walidacja kategorii specjalnych
        When(v => v.SpecialCategories != null && v.SpecialCategories.Any(), () =>
        {
            RuleForEach(v => v.SpecialCategories)
                .ChildRules(category =>
                {
                    category.RuleFor(c => c.CategoryDefinitionId)
                        .NotEmpty().WithMessage("ID definicji kategorii specjalnej jest wymagane.")
                        .MustAsync(CategoryDefinitionMustExist).WithMessage("Definicja kategorii specjalnej nie istnieje.");

                    category.When(c => c.FishSpeciesId.HasValue, () =>
                    {
                        category.RuleFor(c => c.FishSpeciesId)
                            .MustAsync(FishSpeciesMustExist).WithMessage("Gatunek ryby dla kategorii specjalnej nie istnieje.");
                    });

                    category.RuleFor(c => c.CustomNameOverride)
                        .MaximumLength(255).WithMessage("Niestandardowa nazwa kategorii nie może przekraczać 255 znaków.");
                });
        });
    }

    private bool BeInFuture(DateTimeOffset startTime)
    {
        return startTime > _timeProvider.GetUtcNow().AddMinutes(5); // Mały bufor na różnice czasowe
    }

    private async Task<bool> FisheryMustExist(int fisheryId, CancellationToken cancellationToken)
    {
        return await _context.Fisheries.AnyAsync(f => f.Id == fisheryId, cancellationToken);
    }

    private async Task<bool> CategoryDefinitionMustExist(int categoryDefinitionId, CancellationToken cancellationToken)
    {
        return await _context.CategoryDefinitions.AnyAsync(cd => cd.Id == categoryDefinitionId, cancellationToken);
    }

    private async Task<bool> FishSpeciesMustExist(int? fishSpeciesId, CancellationToken cancellationToken)
    {
        if (!fishSpeciesId.HasValue) return true; // Opcjonalne
        return await _context.FishSpecies.AnyAsync(fs => fs.Id == fishSpeciesId.Value, cancellationToken);
    }

    private bool BeValidUrl(string? url)
    {
        if (string.IsNullOrEmpty(url)) return true;
        return Uri.TryCreate(url, UriKind.Absolute, out _);
    }
}
