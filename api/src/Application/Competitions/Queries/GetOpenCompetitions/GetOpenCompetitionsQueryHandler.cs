namespace Fishio.Application.Competitions.Queries.GetOpenCompetitions;

public class GetOpenCompetitionsQueryHandler : IRequestHandler<GetOpenCompetitionsQuery, PaginatedList<CompetitionSummaryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly TimeProvider _timeProvider;
    private readonly ICurrentUserService _currentUserService;

    public GetOpenCompetitionsQueryHandler(IApplicationDbContext context, TimeProvider timeProvider, ICurrentUserService currentUserService)
    {
        _context = context;
        _timeProvider = timeProvider;
        _currentUserService = currentUserService;
    }

    public async Task<PaginatedList<CompetitionSummaryDto>> Handle(GetOpenCompetitionsQuery request, CancellationToken cancellationToken)
    {
        var now = _timeProvider.GetUtcNow();
        var currentUserId = _currentUserService.UserId;

        IQueryable<Competition> query = _context.Competitions
            .AsNoTracking()
            .Where(c => c.Type == CompetitionType.Public &&
                        (c.Status == CompetitionStatus.AcceptingRegistrations ||
                         c.Status == CompetitionStatus.Scheduled))
            .Include(c => c.Fishery)
            .Include(c => c.Participants)
            .Include(c => c.Categories).ThenInclude(cc => cc.CategoryDefinition);

        // Wyklucz zawody w których użytkownik już uczestniczy jako organizator lub uczestnik
        if (currentUserId.HasValue && currentUserId.Value > 0)
        {
            query = query.Where(c => c.OrganizerId != currentUserId.Value &&
                                     !c.Participants.Any(p => p.UserId == currentUserId.Value));
        }

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(searchTerm) ||
                                     (c.Fishery != null && c.Fishery.Name.ToLower().Contains(searchTerm)));
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
