using Fishio.Application.Common.Exceptions;

namespace Fishio.Application.LogbookEntries.Commands.DeleteLogbookEntry;

public class DeleteLogbookEntryCommandHandler : IRequestHandler<DeleteLogbookEntryCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public DeleteLogbookEntryCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(DeleteLogbookEntryCommand request, CancellationToken cancellationToken)
    {
        var domainUserId = _currentUserService.UserId;
        if (!domainUserId.HasValue || domainUserId.Value == 0)
        {
            throw new UnauthorizedAccessException("Użytkownik nie jest zidentyfikowany.");
        }

        var logbookEntry = await _context.LogbookEntries
            .FirstOrDefaultAsync(le => le.Id == request.Id, cancellationToken);

        if (logbookEntry == null)
        {
            throw new NotFoundException(nameof(LogbookEntry), request.Id.ToString());
        }

        if (logbookEntry.UserId != domainUserId.Value)
        {
            throw new ForbiddenAccessException();
        }

        // TODO: Optionally delete image from Cloudinary using ImagePublicId
        // This could be implemented as a background job or through a proper service

        _context.LogbookEntries.Remove(logbookEntry);
        var result = await _context.SaveChangesAsync(cancellationToken);

        return result > 0;
    }
}
