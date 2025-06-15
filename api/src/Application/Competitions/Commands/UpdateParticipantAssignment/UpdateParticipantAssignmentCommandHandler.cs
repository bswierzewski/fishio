using Fishio.Application.Common.Exceptions;

namespace Fishio.Application.Competitions.Commands.UpdateParticipantAssignment;

public class UpdateParticipantAssignmentCommandHandler : IRequestHandler<UpdateParticipantAssignmentCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateParticipantAssignmentCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(UpdateParticipantAssignmentCommand request, CancellationToken cancellationToken)
    {
        var competition = await _context.Competitions
            .Include(c => c.Participants)
            .FirstOrDefaultAsync(c => c.Id == request.CompetitionId, cancellationToken);

        if (competition == null)
        {
            throw new NotFoundException(nameof(Competition), request.CompetitionId.ToString());
        }

        var currentUserId = _currentUserService.UserId;
        if (competition.OrganizerId != currentUserId)
        {
            throw new ForbiddenAccessException("Tylko organizator może zarządzać przypisaniami uczestników.");
        }

        var participant = competition.Participants
            .FirstOrDefault(p => p.Id == request.ParticipantId &&
                                p.Role == ParticipantRole.Competitor &&
                                p.Status == ParticipantStatus.Approved);

        if (participant == null)
        {
            throw new NotFoundException("Uczestnik nie został znaleziony lub nie jest zatwierdzonym zawodnikiem.", request.ParticipantId.ToString());
        }

        // Sprawdź czy stanowisko nie jest już zajęte przez innego uczestnika
        if (!string.IsNullOrWhiteSpace(request.Sector) && !string.IsNullOrWhiteSpace(request.Stand))
        {
            var conflictingParticipant = competition.Participants
                .FirstOrDefault(p => p.Id != request.ParticipantId &&
                                    p.Sector == request.Sector?.Trim() &&
                                    p.Stand == request.Stand?.Trim() &&
                                    p.Role == ParticipantRole.Competitor &&
                                    p.Status == ParticipantStatus.Approved);

            if (conflictingParticipant != null)
            {
                var conflictingName = conflictingParticipant.User?.Name ?? conflictingParticipant.GuestName ?? "Nieznany uczestnik";
                throw new InvalidOperationException($"Stanowisko '{request.Stand}' w sektorze '{request.Sector}' jest już zajęte przez uczestnika: {conflictingName}");
            }
        }

        participant.AssignToSectorAndStand(request.Sector, request.Stand);

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}