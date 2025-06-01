namespace Fishio.Application.Fisheries.Commands.UpdateFishery;

// Używamy class dla komendy, aby umożliwić np. logikę w setterach, jeśli byłaby potrzebna,
// lub jeśli preferujemy tradycyjne klasy dla komend.
// Record byłby też dobrym wyborem, jeśli chcemy prosty nośnik danych.
public class UpdateFisheryCommand : IRequest<bool> // Zwraca bool wskazujący sukces
{
    public int Id { get; set; } // ID łowiska do aktualizacji
    public string Name { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string? ImageUrl { get; set; } // Nowy URL zdjęcia (opcjonalny)
    public string? ImagePublicId { get; set; } // Nowy PublicId zdjęcia (opcjonalny)
    public bool RemoveCurrentImage { get; set; } = false; // Flaga do usunięcia obecnego zdjęcia
    public List<int>? FishSpeciesIds { get; set; } // Pełna lista ID gatunków dla tego łowiska
}

public class UpdateFisheryCommandValidator : AbstractValidator<UpdateFisheryCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateFisheryCommandValidator(IApplicationDbContext context)
    {
        _context = context;

        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("ID łowiska jest wymagane.");

        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Nazwa łowiska jest wymagana.")
            .MaximumLength(255).WithMessage("Nazwa łowiska nie może przekraczać 255 znaków.")
            .MustAsync(BeUniqueNameForAnotherFishery).WithMessage("Łowisko o tej nazwie już istnieje.");

        RuleFor(v => v.Location)
            .MaximumLength(1000).WithMessage("Lokalizacja nie może przekraczać 1000 znaków.");

        RuleForEach(x => x.FishSpeciesIds)
            .GreaterThan(0).When(x => x != null).WithMessage("Nieprawidłowe ID gatunku ryby.");

        When(x => !string.IsNullOrEmpty(x.ImageUrl), () =>
        {
            RuleFor(x => x.ImageUrl)
                .Must(BeValidUrl).WithMessage("Nieprawidłowy URL zdjęcia.");
        });
    }

    private async Task<bool> BeUniqueNameForAnotherFishery(UpdateFisheryCommand command, string name, CancellationToken cancellationToken)
    {
        // Nazwa musi być unikalna LUB musi należeć do aktualizowanego łowiska
        return !await _context.Fisheries
            .AnyAsync(f => f.Id != command.Id && f.Name == name, cancellationToken);
    }

    private bool BeValidUrl(string? url)
    {
        if (string.IsNullOrEmpty(url)) return true;
        return Uri.TryCreate(url, UriKind.Absolute, out _);
    }
}
