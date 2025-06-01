namespace Fishio.Application.LookupData.Queries.GetFishSpeciesQuery;

public record GetFishSpeciesQuery : IRequest<IEnumerable<FishSpeciesDto>>;

public record FishSpeciesDto(int Id, string Name, string? ImageUrl);