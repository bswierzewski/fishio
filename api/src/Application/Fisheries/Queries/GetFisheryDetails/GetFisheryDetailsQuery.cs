namespace Fishio.Application.Fisheries.Queries.GetFisheryDetails;

public record GetFisheryDetailsQuery(int Id) : IRequest<FisheryDetailsDto>;

public class GetFisheryDetailsQueryValidator : AbstractValidator<GetFisheryDetailsQuery>
{
    public GetFisheryDetailsQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Id łowiska jest wymagane.");
    }
}

public record FisheryDetailsDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Location { get; init; }
    public string Description { get; init; } = string.Empty;
    public string? OwnerName { get; set; } // Nazwa użytkownika, który dodał
    public int? OwnerId { get; set; }
    public string? ImageUrl { get; set; }
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset? LastModifiedAt { get; init; }
    public FisheryStatisticsDto Statistics { get; init; } = new();
    public List<FisheryFishSpeciesDto> FishSpecies { get; init; } = new();
}

public record FisheryFishSpeciesDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? ImageUrl { get; init; }
    public int CatchesCount { get; init; }
    public decimal? AverageLength { get; init; }
    public decimal? AverageWeight { get; init; }
}

public record FisheryStatisticsDto
{
    public int TotalCatchesCount { get; init; }
    public int TotalAnglers { get; init; }
    public int TotalCompetitions { get; init; }
    public DateTimeOffset? LastCatchDate { get; init; }
}