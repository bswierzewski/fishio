namespace Fishio.Application.Dashboard.Queries.GetDashboardData;

public class GetDashboardDataQueryHandler : IRequestHandler<GetDashboardDataQuery, DashboardDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly TimeProvider _timeProvider;

    public GetDashboardDataQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        TimeProvider timeProvider)
    {
        _context = context;
        _currentUserService = currentUserService;
        _timeProvider = timeProvider;
    }

    public async Task<DashboardDto> Handle(GetDashboardDataQuery request, CancellationToken cancellationToken)
    {
        var currentUser = await _currentUserService.GetOrProvisionDomainUserAsync(cancellationToken);
        if (currentUser == null || currentUser.Id == 0)
        {
            throw new UnauthorizedAccessException("Użytkownik nie jest zidentyfikowany lub nie istnieje w domenie.");
        }

        var dashboardDto = new DashboardDto
        {
            UserName = currentUser.Name
        };

        var now = _timeProvider.GetUtcNow();

        // 1. Moje Zawody
        var userCompetitionsQuery = _context.CompetitionParticipants
            .AsNoTracking()
            .Where(cp => cp.UserId == currentUser.Id)
            .Select(cp => new
            {
                Competition = cp.Competition,
                cp.Competition.Fishery,
                Role = cp.Role
            });

        var allMyCompetitions = await userCompetitionsQuery
            .OrderByDescending(x => x.Competition.Schedule.Start)
            .ToListAsync(cancellationToken);

        dashboardDto.MyUpcomingCompetitions.AddRange(
            allMyCompetitions
                .Where(x => x.Competition.Status == CompetitionStatus.Ongoing ||
                              x.Competition.Status == CompetitionStatus.AcceptingRegistrations ||
                              x.Competition.Status == CompetitionStatus.Scheduled)
                .Take(request.MaxRecentItems) // Użycie wartości z requestu
                .Select(x => new DashboardCompetitionSummaryDto
                {
                    Id = x.Competition.Id,
                    Name = x.Competition.Name,
                    StartTime = x.Competition.Schedule.Start,
                    Status = x.Competition.Status,
                    FisheryName = x.Fishery?.Name,
                    IsOrganizer = x.Role == ParticipantRole.Organizer || x.Competition.OrganizerId == currentUser.Id,
                    IsJudge = x.Role == ParticipantRole.Judge,
                    IsParticipant = x.Role == ParticipantRole.Competitor
                }));

        dashboardDto.MyRecentCompetitions.AddRange(
            allMyCompetitions
                .Where(x => x.Competition.Status == CompetitionStatus.Finished)
                .OrderByDescending(x => x.Competition.Schedule.End)
                .Take(request.MaxRecentItems) // Użycie wartości z requestu
                .Select(x => new DashboardCompetitionSummaryDto
                {
                    Id = x.Competition.Id,
                    Name = x.Competition.Name,
                    StartTime = x.Competition.Schedule.Start,
                    Status = x.Competition.Status,
                    FisheryName = x.Fishery?.Name,
                    IsOrganizer = x.Role == ParticipantRole.Organizer || x.Competition.OrganizerId == currentUser.Id,
                    IsJudge = x.Role == ParticipantRole.Judge,
                    IsParticipant = x.Role == ParticipantRole.Competitor
                }));

        // 2. Ostatnie Połowy (z Dziennika)
        var recentLogbookEntries = await _context.LogbookEntries
            .AsNoTracking()
            .Where(le => le.UserId == currentUser.Id)
            .OrderByDescending(le => le.CatchTime)
            .Take(request.MaxRecentItems) // Użycie wartości z requestu
            .Include(le => le.FishSpecies)
            .Select(le => new DashboardLogbookSummaryDto
            {
                Id = le.Id,
                ImageUrl = le.ImageUrl,
                CatchTime = le.CatchTime,
                FishSpeciesName = le.FishSpecies != null ? le.FishSpecies.Name : null,
                LengthInCm = le.Length != null ? le.Length.Value : (decimal?)null,
                WeightInKg = le.Weight != null ? le.Weight.Value : (decimal?)null
            })
            .ToListAsync(cancellationToken);
        dashboardDto.RecentLogbookEntries.AddRange(recentLogbookEntries);

        // 3. Odkryj Otwarte Zawody
        var openCompetitions = await _context.Competitions
            .AsNoTracking()
            .Where(c => (c.Type == CompetitionType.Public) &&
                        (c.Status == CompetitionStatus.AcceptingRegistrations || c.Status == CompetitionStatus.Scheduled) &&
                        c.OrganizerId != currentUser.Id &&
                        !c.Participants.Any(p => p.UserId == currentUser.Id))
            .OrderBy(c => c.Schedule.Start)
            .Take(request.MaxFeaturedItems) // Użycie wartości z requestu
            .Include(c => c.Fishery)
            .Select(c => new DashboardCompetitionSummaryDto
            {
                Id = c.Id,
                Name = c.Name,
                StartTime = c.Schedule.Start,
                Status = c.Status,
                FisheryName = c.Fishery != null ? c.Fishery.Name : null,
                IsOrganizer = false,
                IsJudge = false,
                IsParticipant = false
            })
            .ToListAsync(cancellationToken);
        dashboardDto.OpenCompetitions.AddRange(openCompetitions);

        // 4. Lista Łowisk (Polecane/Nowe)
        var featuredFisheries = await _context.Fisheries
            .AsNoTracking()
            .OrderByDescending(f => f.Created)
            .Take(request.MaxFeaturedItems) // Użycie wartości z requestu
            .Include(f => f.FishSpecies)
            .Select(f => new DashboardFisherySummaryDto
            {
                Id = f.Id,
                Name = f.Name,
                Location = f.Location,
                ImageUrl = f.ImageUrl,
                FishSpeciesCount = f.FishSpecies.Count
            })
            .ToListAsync(cancellationToken);
        dashboardDto.FeaturedFisheries.AddRange(featuredFisheries);

        return dashboardDto;
    }
}
