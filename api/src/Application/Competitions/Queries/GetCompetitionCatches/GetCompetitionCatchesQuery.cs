namespace Fishio.Application.Competitions.Queries.GetCompetitionCatches;

public class GetCompetitionCatchesQuery : IRequest<List<CompetitionFishCatchDto>>
{
    public int CompetitionId { get; set; }

    public GetCompetitionCatchesQuery(int competitionId)
    {
        CompetitionId = competitionId;
    }
}