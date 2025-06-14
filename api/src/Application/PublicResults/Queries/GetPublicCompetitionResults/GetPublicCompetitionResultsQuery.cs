namespace Fishio.Application.PublicResults.Queries.GetPublicCompetitionResults;

public class GetPublicCompetitionResultsQuery : IRequest<PublicCompetitionResultsDto?> // Może zwrócić null, jeśli token nieprawidłowy
{
    public string ResultsToken { get; set; } = string.Empty;

    public GetPublicCompetitionResultsQuery(string resultsToken)
    {
        ResultsToken = resultsToken;
    }
}

public class GetPublicCompetitionResultsQueryValidator : AbstractValidator<GetPublicCompetitionResultsQuery>
{
    public GetPublicCompetitionResultsQueryValidator()
    {
        RuleFor(x => x.ResultsToken)
                    .NotEmpty().WithMessage("Token wyników jest wymagany.")
                    .Length(10, 64).WithMessage("Token wyników musi mieć od 10 do 64 znaków.");
    }
}

// --- Główne DTO ---
public record PublicCompetitionResultsDto
{
    public int CompetitionId { get; init; }
    public string CompetitionName { get; init; } = string.Empty;
    public DateTimeOffset StartTime { get; init; }
    public DateTimeOffset EndTime { get; init; }
    public CompetitionStatus Status { get; init; }
    public string? FisheryName { get; init; }
    public string? FisheryLocation { get; init; }
    public string? CompetitionImageUrl { get; init; }
    public int TotalParticipants { get; init; }
    public int TotalCatches { get; init; }
    public DateTimeOffset LastUpdated { get; init; }

    // Kategorie z rankingami
    public List<CategoryResultDto> CategoryResults { get; init; } = [];
}

public record CategoryResultDto
{
    public int CategoryId { get; init; }
    public string CategoryName { get; init; } = string.Empty;
    public string? CategoryDescription { get; init; }
    public bool IsPrimaryScoring { get; init; }
    public CategoryType CategoryType { get; init; }
    public CategoryMetric Metric { get; init; }
    public CategoryCalculationLogic CalculationLogic { get; init; }
    public CategoryEntityType EntityType { get; init; }
    public string? FishSpeciesName { get; init; }
    public int MaxWinnersToDisplay { get; init; }
    public string MetricUnit { get; init; } = string.Empty; // np. "cm", "kg", "szt."

    // Ranking uczestników w tej kategorii
    public List<ParticipantResultDto> Rankings { get; init; } = [];
}

public record ParticipantResultDto
{
    public int ParticipantId { get; init; }
    public string ParticipantName { get; init; } = string.Empty;
    public int Position { get; set; }
    public decimal? Value { get; init; } // Wartość w danej kategorii
    public string ValueDisplay { get; init; } = string.Empty; // Sformatowana wartość do wyświetlenia
    public int CatchesCount { get; init; } // Liczba połowów uczestnika w tej kategorii

    // Szczegóły najlepszego połowu (dla kategorii FishCatch)
    public BestCatchDetailsDto? BestCatch { get; init; }

    // Lista wszystkich połowów (dla kategorii agregujących)
    public List<CatchSummaryDto> AllCatches { get; init; } = [];
}

public record BestCatchDetailsDto
{
    public int CatchId { get; init; }
    public string? FishSpeciesName { get; init; }
    public decimal? LengthInCm { get; init; }
    public decimal? WeightInKg { get; init; }
    public DateTimeOffset CatchTime { get; init; }
    public string JudgeName { get; init; } = string.Empty;
}

public record CatchSummaryDto
{
    public int CatchId { get; init; }
    public string? FishSpeciesName { get; init; }
    public decimal? LengthInCm { get; init; }
    public decimal? WeightInKg { get; init; }
    public DateTimeOffset CatchTime { get; init; }
}