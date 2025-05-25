using Fishio.Application.Competitions.Queries.GetOpenCompetitions;
// CompetitionSummaryDto jest w Fishio.Application.Competitions.Queries

namespace Fishio.Application.Competitions.Queries.GetMyCompetitions;

public enum MyCompetitionFilter
{
    All,
    Upcoming, // AcceptingRegistrations, Scheduled, Upcoming, Ongoing
    Finished,
    Organized,
    Judged
}

// New DTO that includes user role information
public record MyCompetitionSummaryDto : CompetitionSummaryDto
{
    public ParticipantRole? UserRole { get; init; }
    public bool IsOrganizer { get; init; }
}

public class GetMyCompetitionsQuery : IRequest<PaginatedList<MyCompetitionSummaryDto>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public MyCompetitionFilter Filter { get; set; } = MyCompetitionFilter.All;
    public string? SearchTerm { get; set; }
}
