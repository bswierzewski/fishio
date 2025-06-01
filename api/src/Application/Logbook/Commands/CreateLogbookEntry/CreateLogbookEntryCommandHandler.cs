using Fishio.Domain.ValueObjects; // Dla FishLength, FishWeight

namespace Fishio.Application.LogbookEntries.Commands.CreateLogbookEntry;

public class CreateLogbookEntryCommandHandler : IRequestHandler<CreateLogbookEntryCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CreateLogbookEntryCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<int> Handle(CreateLogbookEntryCommand request, CancellationToken cancellationToken)
    {
        // Używamy UserId (int?) z ICurrentUserService, który powinien być ustawiony przez middleware
        var domainUserId = _currentUserService.UserId;

        if (!domainUserId.HasValue || domainUserId.Value == 0)
        {
            // Ten scenariusz nie powinien wystąpić, jeśli UserProvisioningMiddleware działa poprawnie
            // i endpoint jest chroniony przez .RequireAuthorization().
            // Jeśli jednak wystąpi, oznacza to problem z przepływem uwierzytelniania/provisioningu.
            throw new UnauthorizedAccessException("Nie udało się zidentyfikować użytkownika domenowego.");
        }

        FishLength? length = request.LengthInCm.HasValue ? new FishLength(request.LengthInCm.Value) : null;
        FishWeight? weight = request.WeightInKg.HasValue ? new FishWeight(request.WeightInKg.Value) : null;

        // Convert to UTC to avoid PostgreSQL timezone issues
        var catchTimeUtc = request.CatchTime?.ToUniversalTime();

        var logbookEntry = new LogbookEntry(
            userId: domainUserId.Value,
            imageUrl: request.ImageUrl,
            catchTime: catchTimeUtc,
            length: length,
            weight: weight,
            notes: request.Notes,
            fishSpeciesId: request.FishSpeciesId,
            fisheryId: request.FisheryId
        );

        _context.LogbookEntries.Add(logbookEntry);
        await _context.SaveChangesAsync(cancellationToken);

        return logbookEntry.Id;
    }
}
