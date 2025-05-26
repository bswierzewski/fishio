using Fishio.Application.Common.Exceptions;

namespace Fishio.Application.Competitions.Commands.ApproveCompetition;

public class ApproveCompetitionCommandHandler : IRequestHandler<ApproveCompetitionCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ApproveCompetitionCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(ApproveCompetitionCommand request, CancellationToken cancellationToken)
    {
        var competition = await _context.Competitions
            .FirstOrDefaultAsync(c => c.Id == request.CompetitionId, cancellationToken);

        if (competition == null)
        {
            throw new NotFoundException(nameof(Competition), request.CompetitionId.ToString());
        }

        // TODO: Add proper admin authorization check here
        // For now, allowing organizer to approve (should be admin/moderator role)
        var userId = _currentUserService.UserId;
        if (competition.OrganizerId != userId)
        {
            throw new ForbiddenAccessException("Tylko uprawniony użytkownik może zatwierdzić zawody.");
        }

        try
        {
            competition.ApproveCompetition();
        }
        catch (InvalidOperationException ex)
        {
            throw new ApplicationException($"Nie można zatwierdzić zawodów: {ex.Message}", ex);
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}