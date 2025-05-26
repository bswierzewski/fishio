using Fishio.Application.Common.Exceptions;

namespace Fishio.Application.Competitions.Commands.ReopenRegistrations;

public class ReopenRegistrationsCommandHandler : IRequestHandler<ReopenRegistrationsCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ReopenRegistrationsCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(ReopenRegistrationsCommand request, CancellationToken cancellationToken)
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
            throw new ForbiddenAccessException("Tylko organizator może ponownie otworzyć rejestracje.");
        }

        try
        {
            competition.ReopenRegistrations();
        }
        catch (InvalidOperationException ex)
        {
            throw new ApplicationException($"Nie można ponownie otworzyć rejestracji: {ex.Message}", ex);
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}