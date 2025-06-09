using Fishio.Application.Common.Exceptions;
using Fishio.Application.Common.Interfaces;

namespace Fishio.Application.Competitions.Queries.GetCompetitionCatches;

public class GetCompetitionCatchesQueryHandler : IRequestHandler<GetCompetitionCatchesQuery, List<CompetitionFishCatchDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetCompetitionCatchesQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<List<CompetitionFishCatchDto>> Handle(GetCompetitionCatchesQuery request, CancellationToken cancellationToken)
    {
        var currentUser = await _currentUserService.GetOrProvisionDomainUserAsync(cancellationToken);
        if (currentUser == null || currentUser.Id == 0)
        {
            throw new UnauthorizedAccessException("Użytkownik musi być zalogowany, aby przeglądać połowy.");
        }

        // Get competition with participants to check authorization
        var competition = await _context.Competitions
            .AsNoTracking()
            .Include(c => c.Participants)
            .FirstOrDefaultAsync(c => c.Id == request.CompetitionId, cancellationToken);

        if (competition == null)
        {
            throw new NotFoundException(nameof(Competition), request.CompetitionId.ToString());
        }

        // Check if user has permission to view catches (organizer, judge, or participant)
        var userParticipation = competition.Participants
            .FirstOrDefault(p => p.UserId == currentUser.Id);

        var isOrganizer = competition.OrganizerId == currentUser.Id;
        var isJudgeOrParticipant = userParticipation != null;

        if (!isOrganizer && !isJudgeOrParticipant)
        {
            throw new ForbiddenAccessException("Nie masz uprawnień do przeglądania połowów w tych zawodach.");
        }

        // Get all catches for the competition
#pragma warning disable CS8601 // Judge.Name is guaranteed to be non-null due to required relationship
        var catches = await _context.CompetitionFishCatches
            .AsNoTracking()
            .Where(fc => fc.CompetitionId == request.CompetitionId)
            .Include(fc => fc.Participant)
                .ThenInclude(p => p.User)
            .Include(fc => fc.Judge)
            .Include(fc => fc.FishSpecies)
            .OrderByDescending(fc => fc.CatchTime)
            .Select(fc => new CompetitionFishCatchDto
            {
                Id = fc.Id,
                CompetitionId = fc.CompetitionId,
                ParticipantId = fc.ParticipantId,
                ParticipantName = fc.Participant.User != null ? fc.Participant.User.Name : fc.Participant.GuestName ?? "Uczestnik",
                JudgeId = fc.JudgeId,
                JudgeName = fc.Judge.Name,
                FishSpeciesId = fc.FishSpeciesId,
                FishSpeciesName = fc.FishSpecies != null ? fc.FishSpecies.Name : null,
                FishSpeciesImageUrl = fc.FishSpecies != null ? fc.FishSpecies.ImageUrl : null,
                LengthInCm = fc.Length != null ? fc.Length.Value : null,
                WeightInKg = fc.Weight != null ? fc.Weight.Value : null,
                CatchTime = fc.CatchTime,
                CreatedAt = fc.Created,
                LastModifiedAt = fc.LastModified
            })
            .ToListAsync(cancellationToken);
#pragma warning restore CS8601

        return catches;
    }
}