using Fishio.Application.Common.Exceptions;

namespace Fishio.Application.Competitions.Commands.ApproveParticipant;

public class ApproveParticipantCommandHandler : IRequestHandler<ApproveParticipantCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ApproveParticipantCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task Handle(ApproveParticipantCommand request, CancellationToken cancellationToken)
    {
        var currentUser = await _currentUserService.GetOrProvisionDomainUserAsync(cancellationToken);
        if (currentUser == null)
        {
            throw new UnauthorizedAccessException("Musisz być zalogowany, aby zatwierdzić uczestnika.");
        }

        var competition = await _context.Competitions
            .Include(c => c.Participants)
            .FirstOrDefaultAsync(c => c.Id == request.CompetitionId, cancellationToken);

        if (competition == null)
        {
            throw new NotFoundException("Zawody nie zostały znalezione.", request.CompetitionId.ToString());
        }

        // Check if current user is organizer
        if (competition.OrganizerId != currentUser.Id)
        {
            throw new ForbiddenAccessException("Tylko organizator może zatwierdzać uczestników.");
        }

        var participant = competition.Participants.FirstOrDefault(p => p.Id == request.ParticipantId);
        if (participant == null)
        {
            throw new NotFoundException("Uczestnik nie został znaleziony.", request.ParticipantId.ToString());
        }

        participant.Approve();

        await _context.SaveChangesAsync(cancellationToken);
    }
}