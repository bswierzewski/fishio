using Fishio.Application.Common.Exceptions;
using Fishio.Domain.ValueObjects; // Dla FishLength, FishWeight

namespace Fishio.Application.LogbookEntries.Commands.UpdateLogbookEntry;

public class UpdateLogbookEntryCommandHandler : IRequestHandler<UpdateLogbookEntryCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateLogbookEntryCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(UpdateLogbookEntryCommand request, CancellationToken cancellationToken)
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

        // Use the provided image URL if specified
        string? newImageUrl = request.ImageUrl ?? logbookEntry.ImageUrl;

        if (request.RemoveCurrentImage)
        {
            newImageUrl = null;
        }

        FishLength? length = request.LengthInCm.HasValue ? new FishLength(request.LengthInCm.Value) : null;
        FishWeight? weight = request.WeightInKg.HasValue ? new FishWeight(request.WeightInKg.Value) : null;

        // Convert to UTC to avoid PostgreSQL timezone issues
        var catchTimeUtc = request.CatchTime?.ToUniversalTime();

        logbookEntry.UpdateDetails(
            imageUrl: newImageUrl,
            catchTime: catchTimeUtc,
            length: length,
            weight: weight,
            notes: request.Notes,
            fishSpeciesId: request.FishSpeciesId,
            fisheryId: request.FisheryId
        );

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
