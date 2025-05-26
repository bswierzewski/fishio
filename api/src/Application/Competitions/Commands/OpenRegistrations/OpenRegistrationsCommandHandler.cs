using Fishio.Application.Common.Exceptions;

namespace Fishio.Application.Competitions.Commands.OpenRegistrations;

public class OpenRegistrationsCommandHandler : IRequestHandler<OpenRegistrationsCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public OpenRegistrationsCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(OpenRegistrationsCommand request, CancellationToken cancellationToken)
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
            throw new ForbiddenAccessException("Tylko organizator może otworzyć rejestracje.");
        }

        try
        {
            competition.OpenRegistrations();
        }
        catch (InvalidOperationException ex)
        {
            throw new ApplicationException($"Nie można otworzyć rejestracji: {ex.Message}", ex);
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}