using Fishio.Application.Common.Exceptions;

namespace Fishio.Application.Competitions.Commands.ScheduleCompetition;

public class ScheduleCompetitionCommandHandler : IRequestHandler<ScheduleCompetitionCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ScheduleCompetitionCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(ScheduleCompetitionCommand request, CancellationToken cancellationToken)
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
            throw new ForbiddenAccessException("Tylko organizator może zaplanować zawody.");
        }

        try
        {
            competition.ScheduleCompetition();
        }
        catch (InvalidOperationException ex)
        {
            throw new ApplicationException($"Nie można zaplanować zawodów: {ex.Message}", ex);
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}