namespace Fishio.Application.Fisheries.Commands.CreateFishery;

public record CreateFisheryCommand : IRequest<int>
{
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Location { get; init; } = string.Empty;
    public string? ImageUrl { get; init; }
    public string? ImagePublicId { get; init; }
    public List<int> FishSpeciesIds { get; init; } = new();
}

public class CreateFisheryCommandValidator : AbstractValidator<CreateFisheryCommand>
{
    private readonly IApplicationDbContext _context;

    public CreateFisheryCommandValidator(IApplicationDbContext context)
    {
        _context = context;

        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Nazwa łowiska jest wymagana.")
            .MaximumLength(255).WithMessage("Nazwa łowiska nie może przekraczać 255 znaków.")
            .MustAsync(BeUniqueName).WithMessage("Łowisko o tej nazwie już istnieje.");

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

    private async Task<bool> BeUniqueName(string name, CancellationToken cancellationToken)
    {
        return !await _context.Fisheries.AnyAsync(f => f.Name == name, cancellationToken);
    }

    private bool BeValidUrl(string? url)
    {
        if (string.IsNullOrEmpty(url)) return true;
        return Uri.TryCreate(url, UriKind.Absolute, out _);
    }
}