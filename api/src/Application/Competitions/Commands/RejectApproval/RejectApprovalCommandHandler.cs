using Fishio.Application.Common.Exceptions;

namespace Fishio.Application.Competitions.Commands.RejectApproval;

public class RejectApprovalCommandHandler : IRequestHandler<RejectApprovalCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public RejectApprovalCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(RejectApprovalCommand request, CancellationToken cancellationToken)
    {
        var competition = await _context.Competitions
            .FirstOrDefaultAsync(c => c.Id == request.CompetitionId, cancellationToken);

        if (competition == null)
        {
            throw new NotFoundException(nameof(Competition), request.CompetitionId.ToString());
        }

        // TODO: Add proper admin authorization check here
        // For now, allowing organizer to reject (should be admin/moderator role)
        var userId = _currentUserService.UserId;
        if (competition.OrganizerId != userId)
        {
            throw new ForbiddenAccessException("Tylko uprawniony użytkownik może odrzucić zatwierdzenie zawodów.");
        }

        try
        {
            competition.RejectApproval(request.Reason);
        }
        catch (InvalidOperationException ex)
        {
            throw new ApplicationException($"Nie można odrzucić zatwierdzenia zawodów: {ex.Message}", ex);
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}