namespace Fishio.Application.LookupData.Queries.GetFishSpeciesQuery;

public class GetFishSpeciesQueryHandler : IRequestHandler<GetFishSpeciesQuery, IEnumerable<FishSpeciesDto>>
{
    private readonly IApplicationDbContext _context;

    public GetFishSpeciesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<FishSpeciesDto>> Handle(GetFishSpeciesQuery request, CancellationToken cancellationToken)
    {
        var fishSpeciesList = await _context.FishSpecies
                    .AsNoTracking()
                    .OrderBy(fs => fs.Name)
                    .Select(fs => new FishSpeciesDto(fs.Id, fs.Name, fs.ImageUrl))
                    .ToListAsync(cancellationToken);

        return fishSpeciesList;
    }
}