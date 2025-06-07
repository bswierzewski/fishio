using Fishio.Application.Competitions.Queries.GetOpenCompetitions;

namespace Fishio.Application.Competitions.Queries.GetCompetitionDetails;

public class GetCompetitionDetailsQueryHandler : IRequestHandler<GetCompetitionDetailsQuery, CompetitionDetailsDto?>
{
    private readonly IApplicationDbContext _context;

    public GetCompetitionDetailsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CompetitionDetailsDto?> Handle(GetCompetitionDetailsQuery request, CancellationToken cancellationToken)
    {
        var competition = await _context.Competitions
            .AsNoTracking()
            .Where(c => c.Id == request.Id)
            .Include(c => c.Organizer)
            .Include(c => c.Fishery)
            .Include(c => c.Categories)
                .ThenInclude(cc => cc.CategoryDefinition)
            .Include(c => c.Categories)
                .ThenInclude(cc => cc.FishSpecies) // Dla nazwy gatunku w kategorii
            .Include(c => c.Participants)
                .ThenInclude(p => p.User) // Dla nazwy użytkownika uczestnika
            .FirstOrDefaultAsync(cancellationToken);

        if (competition == null)
        {
            return null;
        }

        var primaryScoringCategory = competition.Categories.FirstOrDefault(c => c.IsPrimaryScoring && c.IsEnabled);

        return new CompetitionDetailsDto
        {
            Id = competition.Id,
            Name = competition.Name,
            StartTime = competition.Schedule.Start,
            EndTime = competition.Schedule.End,
            Status = competition.Status,
            Type = competition.Type,
            FisheryId = competition.FisheryId,
            FisheryName = competition.Fishery?.Name,
            FisheryLocation = competition.Fishery?.Location,
            ImageUrl = competition.ImageUrl,
            ParticipantsCount = competition.Participants.Count(p => p.Role == ParticipantRole.Competitor),
            PrimaryScoringInfo = primaryScoringCategory != null
                ? (primaryScoringCategory.CustomNameOverride ?? primaryScoringCategory.CategoryDefinition.Name) +
                  (primaryScoringCategory.CategoryDefinition.Metric != CategoryMetric.NotApplicable ? $" ({GetMetricAbbreviation(primaryScoringCategory.CategoryDefinition.Metric)})" : "")
                : "Brak informacji",
            OrganizerName = competition.Organizer.Name,
            OrganizerId = competition.OrganizerId,
            Rules = competition.Rules,
            ResultsToken = competition.ResultsToken,
            Categories = competition.Categories.Where(c => c.IsEnabled).Select(c => new CompetitionCategoryDto
            {
                Id = c.Id,
                Name = c.CustomNameOverride ?? c.CategoryDefinition.Name,
                Description = c.CustomDescriptionOverride ?? c.CategoryDefinition.Description,
                IsPrimaryScoring = c.IsPrimaryScoring,
                DefinitionType = c.CategoryDefinition.Type,
                DefinitionMetric = c.CategoryDefinition.Metric,
                FishSpeciesName = c.FishSpecies?.Name
            }).OrderBy(c => c.IsPrimaryScoring ? 0 : 1).ThenBy(c => c.Name).ToList(),
            ParticipantsList = competition.Participants.Select(p => new CompetitionParticipantDto
            {
                Id = p.Id,
                UserId = p.UserId,
                Name = p.User?.Name ?? p.GuestName ?? "Uczestnik",
                Role = p.Role,
                AddedByOrganizer = p.AddedByOrganizer
            }).OrderBy(p => p.Name).ToList()
        };
    }
    private string GetMetricAbbreviation(CategoryMetric metric)
    {
        return metric switch
        {
            CategoryMetric.LengthCm => "cm",
            CategoryMetric.WeightKg => "kg",
            CategoryMetric.FishCount => "szt.",
            _ => metric.ToString()
        };
    }
}
