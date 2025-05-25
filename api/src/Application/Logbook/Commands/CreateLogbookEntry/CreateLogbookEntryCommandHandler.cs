using Application.Common.Interfaces.Services;
using Fishio.Domain.ValueObjects; // Dla FishLength, FishWeight

namespace Fishio.Application.LogbookEntries.Commands.CreateLogbookEntry;

public class CreateLogbookEntryCommandHandler : IRequestHandler<CreateLogbookEntryCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IImageStorageService _imageStorageService;

    public CreateLogbookEntryCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IImageStorageService imageStorageService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _imageStorageService = imageStorageService;
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

        ImageUploadResult imageResult;
        await using (var memoryStream = new MemoryStream())
        {
            await request.Image.CopyToAsync(memoryStream, cancellationToken);
            memoryStream.Position = 0;
            imageResult = await _imageStorageService.UploadImageAsync(
                memoryStream,
                request.Image.FileName,
                $"logbook/{domainUserId.Value}"); // Używamy domainUserId.Value
        }

        if (!imageResult.Success || string.IsNullOrEmpty(imageResult.Url))
        {
            throw new ApplicationException($"Nie udało się przesłać zdjęcia dla wpisu w dzienniku: {imageResult.ErrorMessage}");
        }

        FishLength? length = request.LengthInCm.HasValue ? new FishLength(request.LengthInCm.Value) : null;
        FishWeight? weight = request.WeightInKg.HasValue ? new FishWeight(request.WeightInKg.Value) : null;

        // Convert to UTC to avoid PostgreSQL timezone issues
        var catchTimeUtc = request.CatchTime?.ToUniversalTime();

        var logbookEntry = new LogbookEntry(
            userId: domainUserId.Value, // Używamy domainUserId.Value
            imageUrl: imageResult.Url,
            catchTime: catchTimeUtc,
            length: length,
            weight: weight,
            notes: request.Notes,
            fishSpeciesId: request.FishSpeciesId,
            fisheryId: request.FisheryId
        );

        _context.LogbookEntries.Add(logbookEntry);
        await _context.SaveChangesAsync(cancellationToken); // Interceptory zajmą się Created, CreatedBy itp.

        return logbookEntry.Id;
    }
}
