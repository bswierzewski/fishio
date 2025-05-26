namespace Fishio.Application.Competitions.Queries.GetOpenCompetitions;

public class GetOpenCompetitionsQueryHandler : IRequestHandler<GetOpenCompetitionsQuery, PaginatedList<CompetitionSummaryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly TimeProvider _timeProvider;

    public GetOpenCompetitionsQueryHandler(IApplicationDbContext context, TimeProvider timeProvider)
    {
        _context = context;
        _timeProvider = timeProvider;
    }

    public async Task<PaginatedList<CompetitionSummaryDto>> Handle(GetOpenCompetitionsQuery request, CancellationToken cancellationToken)
    {
        var now = _timeProvider.GetUtcNow();

        IQueryable<Competition> query = _context.Competitions
            .AsNoTracking()
            .Where(c => c.Type == CompetitionType.Public &&
                        (c.Status == CompetitionStatus.AcceptingRegistrations ||
                         c.Status == CompetitionStatus.Scheduled ||
                         c.Status == CompetitionStatus.Upcoming) &&
                        c.Schedule.Start > now) // Tylko te, które się jeszcze nie rozpoczęły
            .Include(c => c.Fishery)
            .Include(c => c.Participants)
            .Include(c => c.Categories).ThenInclude(cc => cc.CategoryDefinition);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(c => c.Name.Contains(request.SearchTerm) ||
                                     (c.Fishery != null && c.Fishery.Name.Contains(request.SearchTerm)));
        }

        query = query.OrderBy(c => c.Schedule.Start); // Najbliższe najpierw

        // Mapowanie na DTO przed paginacją, aby móc użyć danych z Include
        var dtoListQuery = query.Select(c => new CompetitionSummaryDto
        {
            Id = c.Id,
            Name = c.Name,
            StartTime = c.Schedule.Start,
            EndTime = c.Schedule.End,
            Status = c.Status, // Można by tu też użyć DetermineEffectiveStatus, jeśli potrzebne
            Type = c.Type,
            FisheryName = c.Fishery != null ? c.Fishery.Name : null,
            ImageUrl = c.ImageUrl,
            ParticipantsCount = c.Participants.Count(p => p.Role == ParticipantRole.Competitor),
            PrimaryScoringInfo = c.Categories
                                  .Where(cat => cat.IsPrimaryScoring && cat.IsEnabled)
                                  .Select(cat => (cat.CustomNameOverride ?? cat.CategoryDefinition.Name) +
                                                 (cat.CategoryDefinition.Metric != CategoryMetric.NotApplicable ? $" ({cat.CategoryDefinition.Metric.ToString()})" : ""))
                                  .FirstOrDefault() ?? "Brak informacji"
        });

        return await PaginatedList<CompetitionSummaryDto>.CreateAsync(dtoListQuery, request.PageNumber, request.PageSize);
    }
}
