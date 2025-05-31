namespace Fishio.Application.Logbook.Queries.GetLogbookStatistics;

public class GetLogbookStatisticsQuery : IRequest<LogbookStatisticsDto>
{
    public int? Year { get; set; } // Optional year filter, if null returns all-time stats
}

public class GetLogbookStatisticsQueryValidator : AbstractValidator<GetLogbookStatisticsQuery>
{
    public GetLogbookStatisticsQueryValidator()
    {
        RuleFor(x => x.Year)
            .GreaterThan(1900).WithMessage("Rok musi być większy od 1900")
            .LessThanOrEqualTo(DateTime.Now.Year + 1).WithMessage("Rok nie może być w przyszłości")
            .When(x => x.Year.HasValue);
    }
}

public record LogbookStatisticsDto
{
    public int TotalCatches { get; init; }
    public int UniqueSpecies { get; init; }
    public int UniqueFisheries { get; init; }
    public decimal? TotalWeightKg { get; init; }
    public decimal? AverageWeightKg { get; init; }
    public decimal? LargestFishWeightKg { get; init; }
    public decimal? AverageLengthCm { get; init; }
    public decimal? LargestFishLengthCm { get; init; }
    public DateTimeOffset? FirstCatchDate { get; init; }
    public DateTimeOffset? LastCatchDate { get; init; }
    public List<LogbookSpeciesStatisticsDto> TopSpecies { get; init; } = new();
    public List<LogbookFisheryStatisticsDto> TopFisheries { get; init; } = new();
    public List<LogbookMonthlyStatisticsDto> MonthlyBreakdown { get; init; } = new();
    public List<LogbookSizeRangeStatisticsDto> SizeRanges { get; init; } = new();
}

public record LogbookSpeciesStatisticsDto
{
    public int FishSpeciesId { get; init; }
    public string SpeciesName { get; init; } = string.Empty;
    public int CatchCount { get; init; }
    public decimal? TotalWeightKg { get; init; }
    public decimal? AverageWeightKg { get; init; }
    public decimal? LargestWeightKg { get; init; }
    public decimal? AverageLengthCm { get; init; }
    public decimal? LargestLengthCm { get; init; }
}

public record LogbookFisheryStatisticsDto
{
    public int FisheryId { get; init; }
    public string FisheryName { get; init; } = string.Empty;
    public int CatchCount { get; init; }
    public int UniqueSpecies { get; init; }
    public decimal? TotalWeightKg { get; init; }
}

public record LogbookMonthlyStatisticsDto
{
    public int Year { get; init; }
    public int Month { get; init; }
    public string MonthName { get; init; } = string.Empty;
    public int CatchCount { get; init; }
    public decimal? TotalWeightKg { get; init; }
    public int UniqueSpecies { get; init; }
}

public record LogbookSizeRangeStatisticsDto
{
    public string RangeName { get; init; } = string.Empty;
    public decimal MinLengthCm { get; init; }
    public decimal MaxLengthCm { get; init; }
    public int CatchCount { get; init; }
    public decimal Percentage { get; init; }
}