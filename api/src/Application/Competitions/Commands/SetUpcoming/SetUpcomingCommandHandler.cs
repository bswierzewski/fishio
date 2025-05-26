using Fishio.Application.Common.Exceptions;

namespace Fishio.Application.Competitions.Commands.SetUpcoming;

public class SetUpcomingCommandHandler : IRequestHandler<SetUpcomingCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public SetUpcomingCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(SetUpcomingCommand request, CancellationToken cancellationToken)
    {
        var competition = await _context.Competitions
            .FirstOrDefaultAsync(c => c.Id == request.CompetitionId, cancellationToken);

        if (competition == null)
        {
            throw new NotFoundException(nameof(Competition), request.CompetitionId.ToString());
        }

        var organizerId = _currentUserService.UserId;
        if (competition.OrganizerId != organizerId)
        {
            throw new ForbiddenAccessException("Tylko organizator może ustawić status 'Upcoming'.");
        }

        try
        {
            competition.SetUpcoming();
        }
        catch (InvalidOperationException ex)
        {
            throw new ApplicationException($"Nie można ustawić statusu 'Upcoming': {ex.Message}", ex);
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}