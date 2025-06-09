using Fishio.Application.Common.Exceptions;

namespace Fishio.Application.Competitions.Commands.DeleteFishCatch;

public class DeleteCompetitionFishCatchCommandHandler : IRequestHandler<DeleteCompetitionFishCatchCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public DeleteCompetitionFishCatchCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(DeleteCompetitionFishCatchCommand request, CancellationToken cancellationToken)
    {
        var currentUser = await _currentUserService.GetOrProvisionDomainUserAsync(cancellationToken);
        if (currentUser == null || currentUser.Id == 0)
        {
            throw new UnauthorizedAccessException("Użytkownik musi być zalogowany, aby usunąć połów.");
        }

        var competition = await _context.Competitions
            .Include(c => c.Participants)
            .Include(c => c.FishCatches)
            .FirstOrDefaultAsync(c => c.Id == request.CompetitionId, cancellationToken);

        if (competition == null)
        {
            throw new NotFoundException(nameof(Competition), request.CompetitionId.ToString());
        }

        var fishCatch = competition.FishCatches.FirstOrDefault(fc => fc.Id == request.FishCatchId);
        if (fishCatch == null)
        {
            throw new NotFoundException(nameof(CompetitionFishCatch), request.FishCatchId.ToString());
        }

        // Check if user is authorized to delete this catch
        // Only the judge who recorded the catch, the organizer, or an organizer can delete it
        var isOrganizer = competition.OrganizerId == currentUser.Id;
        var isJudgeWhoRecorded = fishCatch.JudgeId == currentUser.Id;
        var isCurrentlyJudge = competition.Participants
            .Any(p => p.UserId == currentUser.Id &&
                     (p.Role == ParticipantRole.Judge || p.Role == ParticipantRole.Organizer));

        if (!isOrganizer && !isJudgeWhoRecorded && !isCurrentlyJudge)
        {
            throw new ForbiddenAccessException("Tylko organizator lub sędzia może usunąć połów.");
        }

        // Remove the fish catch
        _context.CompetitionFishCatches.Remove(fishCatch);
        var result = await _context.SaveChangesAsync(cancellationToken);

        return result > 0;
    }
}