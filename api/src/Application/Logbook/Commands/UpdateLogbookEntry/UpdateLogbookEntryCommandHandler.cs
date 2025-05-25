using Application.Common.Interfaces.Services;
using Fishio.Application.Common.Exceptions; // Dla NotFoundException, ForbiddenAccessException
using Fishio.Domain.ValueObjects;

namespace Fishio.Application.LogbookEntries.Commands.UpdateLogbookEntry;

public class UpdateLogbookEntryCommandHandler : IRequestHandler<UpdateLogbookEntryCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IImageStorageService _imageStorageService;

    public UpdateLogbookEntryCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IImageStorageService imageStorageService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _imageStorageService = imageStorageService;
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

        string newImageUrl = logbookEntry.ImageUrl; // Domyślnie stary URL

        // TODO: Potrzebujemy przechowywać ImagePublicId w LogbookEntry, aby móc usuwać z Cloudinary
        // string? oldImagePublicId = logbookEntry.ImagePublicId;

        if (request.RemoveCurrentImage && !string.IsNullOrEmpty(logbookEntry.ImageUrl))
        {
            // if (!string.IsNullOrEmpty(oldImagePublicId))
            // {
            //     await _imageStorageService.DeleteImageAsync(oldImagePublicId);
            // }
            newImageUrl = string.Empty; // Ustawiamy na pusty string lub null, w zależności od logiki
            // logbookEntry.ImagePublicId = null;
        }

        if (request.Image != null && request.Image.Length > 0)
        {
            // Jeśli jest nowe zdjęcie, usuń stare (jeśli istniało i nie zostało już usunięte)
            // if (!request.RemoveCurrentImage && !string.IsNullOrEmpty(oldImagePublicId))
            // {
            //     await _imageStorageService.DeleteImageAsync(oldImagePublicId);
            // }

            ImageUploadResult imageResult;
            await using (var memoryStream = new MemoryStream())
            {
                await request.Image.CopyToAsync(memoryStream, cancellationToken);
                memoryStream.Position = 0;
                imageResult = await _imageStorageService.UploadImageAsync(
                    memoryStream,
                    request.Image.FileName,
                    $"logbook/{domainUserId.Value}");
            }

            if (!imageResult.Success || string.IsNullOrEmpty(imageResult.Url))
            {
                throw new ApplicationException($"Nie udało się przesłać nowego zdjęcia: {imageResult.ErrorMessage}");
            }
            newImageUrl = imageResult.Url;
            // logbookEntry.ImagePublicId = imageResult.PublicId; // Zapisz nowy PublicId
        }

        FishLength? length = request.LengthInCm.HasValue ? new FishLength(request.LengthInCm.Value) : null;
        FishWeight? weight = request.WeightInKg.HasValue ? new FishWeight(request.WeightInKg.Value) : null;

        // Convert to UTC to avoid PostgreSQL timezone issues
        var catchTimeUtc = request.CatchTime?.ToUniversalTime();

        // Użyj metody domenowej do aktualizacji (lub zaktualizuj pola bezpośrednio, jeśli nie ma metody)
        logbookEntry.UpdateDetails(
            imageUrl: newImageUrl, // Przekazujemy zaktualizowany URL
            catchTime: catchTimeUtc ?? logbookEntry.CatchTime, // Jeśli null, zostaw stare
            length: length, // Przekazujemy nowe lub null
            weight: weight, // Przekazujemy nowe lub null
            notes: request.Notes, // Może być null, aby wyczyścić
            fishSpeciesId: request.FishSpeciesId, // Może być null
            fisheryId: request.FisheryId // Może być null
        );

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
