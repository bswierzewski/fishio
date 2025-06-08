using Fishio.Application.Common.Exceptions;

namespace Fishio.Application.Competitions.Commands.RejectParticipant;

public class RejectParticipantCommandHandler : IRequestHandler<RejectParticipantCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public RejectParticipantCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task Handle(RejectParticipantCommand request, CancellationToken cancellationToken)
    {
        var currentUser = await _currentUserService.GetOrProvisionDomainUserAsync(cancellationToken);
        if (currentUser == null)
        {
            throw new UnauthorizedAccessException("Musisz być zalogowany, aby odrzucić uczestnika.");
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
            throw new ForbiddenAccessException("Tylko organizator może odrzucać uczestników.");
        }

        var participant = competition.Participants.FirstOrDefault(p => p.Id == request.ParticipantId);
        if (participant == null)
        {
            throw new NotFoundException("Uczestnik nie został znaleziony.", request.ParticipantId.ToString());
        }

        participant.Reject();

        await _context.SaveChangesAsync(cancellationToken);
    }
}