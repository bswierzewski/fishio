namespace Fishio.Application.Fisheries.Queries.GetFisheryDetails;

public class GetFisheryDetailsQueryHandler : IRequestHandler<GetFisheryDetailsQuery, FisheryDetailsDto>
{
    private readonly IApplicationDbContext _context;

    public GetFisheryDetailsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<FisheryDetailsDto> Handle(GetFisheryDetailsQuery request, CancellationToken cancellationToken)
    {
        var fishery = await _context.Fisheries
            .AsNoTracking()
            .Include(f => f.User)
            .Include(f => f.FishSpecies)
            .FirstOrDefaultAsync(f => f.Id == request.Id, cancellationToken);

        if (fishery == null)
            throw new NotFoundException(nameof(Fishery), request.Id.ToString());

        // Pobieranie danych do statystyk z LogbookEntries powiązanych z tym łowiskiem
        var logbookEntriesOnFishery = await _context.LogbookEntries
            .AsNoTracking()
            .Where(le => le.FisheryId == fishery.Id)
            .ToListAsync(cancellationToken);

        var fishSpeciesDetailsList = new List<FisheryFishSpeciesDto>();
        foreach (var definedSpecies in fishery.FishSpecies.OrderBy(fs => fs.Name))
        {
            var catchesOfThisSpecies = logbookEntriesOnFishery
                .Where(le => le.FishSpeciesId == definedSpecies.Id)
                .ToList();

            fishSpeciesDetailsList.Add(new FisheryFishSpeciesDto
            {
                Id = definedSpecies.Id,
                Name = definedSpecies.Name,
                ImageUrl = definedSpecies.ImageUrl,
                CatchesCount = catchesOfThisSpecies.Count,
                AverageLength = catchesOfThisSpecies.Any(c => c.Length != null)
                    ? Math.Round(catchesOfThisSpecies.Average(c => c.Length?.Value ?? 0), 2)
                    : null,
                AverageWeight = catchesOfThisSpecies.Any(c => c.Weight != null)
                    ? Math.Round(catchesOfThisSpecies.Average(c => c.Weight?.Value ?? 0), 3)
                    : null
            });
        }

        var totalCompetitions = await _context.Competitions
            .AsNoTracking()
            .CountAsync(c => c.FisheryId == fishery.Id, cancellationToken);

        var statistics = new FisheryStatisticsDto
        {
            TotalCatchesCount = logbookEntriesOnFishery.Count,
            TotalAnglers = logbookEntriesOnFishery.Select(le => le.UserId).Distinct().Count(),
            TotalCompetitions = totalCompetitions,
            LastCatchDate = logbookEntriesOnFishery.Any()
                ? logbookEntriesOnFishery.Max(le => le.CatchTime)
                : null
        };

        return new FisheryDetailsDto
        {
            Id = fishery.Id,
            Name = fishery.Name,
            Location = fishery.Location,
            OwnerName = fishery.User?.Name,
            OwnerId = fishery.UserId,
            ImageUrl = fishery.ImageUrl,
            CreatedAt = fishery.Created,
            LastModifiedAt = fishery.LastModified,
            FishSpecies = fishSpeciesDetailsList,
            Statistics = statistics
        };
    }
}