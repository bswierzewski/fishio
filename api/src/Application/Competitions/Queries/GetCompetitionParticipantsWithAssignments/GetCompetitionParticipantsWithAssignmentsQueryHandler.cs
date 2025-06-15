namespace Fishio.Application.Competitions.Queries.GetCompetitionParticipantsWithAssignments;

public class GetCompetitionParticipantsWithAssignmentsQueryHandler : IRequestHandler<GetCompetitionParticipantsWithAssignmentsQuery, CompetitionParticipantsWithAssignmentsDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetCompetitionParticipantsWithAssignmentsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<CompetitionParticipantsWithAssignmentsDto> Handle(GetCompetitionParticipantsWithAssignmentsQuery request, CancellationToken cancellationToken)
    {
        var competition = await _context.Competitions
            .AsNoTracking()
            .Include(c => c.Participants.Where(p => p.Role == ParticipantRole.Competitor && p.Status == ParticipantStatus.Approved))
                .ThenInclude(p => p.User)
            .FirstOrDefaultAsync(c => c.Id == request.CompetitionId, cancellationToken);

        if (competition == null)
        {
            throw new NotFoundException(nameof(Competition), request.CompetitionId.ToString());
        }

        var currentUserId = _currentUserService.UserId;
        var canManageAssignments = competition.OrganizerId == currentUserId;

        var participants = competition.Participants
            .Where(p => p.Role == ParticipantRole.Competitor && p.Status == ParticipantStatus.Approved)
            .OrderBy(p => p.Sector ?? "")
            .ThenBy(p => p.Stand ?? "")
            .ThenBy(p => p.User?.Name ?? p.GuestName)
            .Select(p => new ParticipantWithAssignmentDto
            {
                Id = p.Id,
                Name = p.User?.Name ?? p.GuestName ?? "Nieznany uczestnik",
                Email = p.User?.Email,
                Sector = p.Sector,
                Stand = p.Stand,
                IsGuest = p.User == null
            })
            .ToList();

        var usedSectors = competition.Participants
            .Where(p => p.Role == ParticipantRole.Competitor &&
                       p.Status == ParticipantStatus.Approved &&
                       !string.IsNullOrWhiteSpace(p.Sector))
            .Select(p => p.Sector!)
            .Distinct()
            .OrderBy(s => s)
            .ToList();

        var usedStands = competition.Participants
            .Where(p => p.Role == ParticipantRole.Competitor &&
                       p.Status == ParticipantStatus.Approved &&
                       !string.IsNullOrWhiteSpace(p.Stand))
            .Select(p => p.Stand!)
            .Distinct()
            .OrderBy(s => s)
            .ToList();

        return new CompetitionParticipantsWithAssignmentsDto
        {
            CompetitionId = competition.Id,
            CompetitionName = competition.Name,
            CanManageAssignments = canManageAssignments,
            Participants = participants,
            UsedSectors = usedSectors,
            UsedStands = usedStands
        };
    }
}