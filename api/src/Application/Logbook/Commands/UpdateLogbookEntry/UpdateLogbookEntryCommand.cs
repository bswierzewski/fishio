namespace Fishio.Application.LogbookEntries.Commands.UpdateLogbookEntry;

public class UpdateLogbookEntryCommand : IRequest<bool> // Zwraca bool wskazujący sukces
{
    public int Id { get; set; } // ID wpisu do aktualizacji
    public string? ImageUrl { get; set; } // Nowy URL zdjęcia (opcjonalny)
    public string? ImagePublicId { get; set; } // Nowy PublicId zdjęcia (opcjonalny)
    public bool RemoveCurrentImage { get; set; } = false;
    public DateTimeOffset? CatchTime { get; set; }
    public decimal? LengthInCm { get; set; }
    public decimal? WeightInKg { get; set; }
    public string? Notes { get; set; }
    public int? FishSpeciesId { get; set; }
    public int? FisheryId { get; set; }
}

public class UpdateLogbookEntryCommandValidator : AbstractValidator<UpdateLogbookEntryCommand>
{
    public UpdateLogbookEntryCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("ID wpisu jest wymagane.");

        When(x => !string.IsNullOrEmpty(x.ImageUrl), () =>
        {
            RuleFor(x => x.ImageUrl)
                .Must(BeValidUrl).WithMessage("Nieprawidłowy URL zdjęcia.");
        });

        RuleFor(x => x.CatchTime)
            .LessThanOrEqualTo(DateTimeOffset.UtcNow.AddHours(1))
            .When(x => x.CatchTime.HasValue)
            .WithMessage("Czas połowu nie może być znacznie w przyszłości.");

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

        When(x => x.FishSpeciesId.HasValue, () =>
        {
            RuleFor(x => x.FishSpeciesId)
                .GreaterThan(0).WithMessage("Nieprawidłowe ID gatunku ryby.");
        });

        When(x => x.FisheryId.HasValue, () =>
        {
            RuleFor(x => x.FisheryId)
                .GreaterThan(0).WithMessage("Nieprawidłowe ID łowiska.");
        });
    }

    private bool BeValidUrl(string? url)
    {
        if (string.IsNullOrEmpty(url)) return true;
        return Uri.TryCreate(url, UriKind.Absolute, out _);
    }
}
