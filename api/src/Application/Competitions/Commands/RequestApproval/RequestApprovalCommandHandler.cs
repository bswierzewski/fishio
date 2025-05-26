using Fishio.Application.Common.Exceptions;

namespace Fishio.Application.Competitions.Commands.RequestApproval;

public class RequestApprovalCommandHandler : IRequestHandler<RequestApprovalCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public RequestApprovalCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(RequestApprovalCommand request, CancellationToken cancellationToken)
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
            throw new ForbiddenAccessException("Tylko organizator może złożyć wniosek o zatwierdzenie.");
        }

        try
        {
            competition.RequestApproval();
        }
        catch (InvalidOperationException ex)
        {
            throw new ApplicationException($"Nie można złożyć wniosku o zatwierdzenie: {ex.Message}", ex);
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}