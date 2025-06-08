using Fishio.Application.Common.Exceptions;
using Fishio.Application.Common.Interfaces;
using Fishio.Domain.Entities;
using Fishio.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Fishio.Application.Competitions.Commands.SetToDraft;

public class SetToDraftCommandHandler : IRequestHandler<SetToDraftCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public SetToDraftCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task Handle(SetToDraftCommand request, CancellationToken cancellationToken)
    {
        var competition = await _context.Competitions
            .FirstOrDefaultAsync(c => c.Id == request.CompetitionId, cancellationToken);

        if (competition == null)
        {
            throw new NotFoundException(nameof(Competition), request.CompetitionId.ToString());
        }

        // Check if user is organizer
        var currentUserId = _currentUserService.UserId;
        if (competition.OrganizerId != currentUserId)
        {
            throw new ForbiddenAccessException("Tylko organizator może przywrócić zawody do szkicu.");
        }

        try
        {
            competition.SetToDraft(request.Reason);
        }
        catch (InvalidOperationException ex)
        {
            throw new ApplicationException($"Nie można przywrócić zawodów do szkicu: {ex.Message}", ex);
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}