using Application.Common.Interfaces.Services;
using Fishio.Application.Common.Exceptions;
using Fishio.Domain.ValueObjects;

namespace Fishio.Application.Competitions.Commands.UpdateCompetition;

public class UpdateCompetitionCommandHandler : IRequestHandler<UpdateCompetitionCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IImageStorageService _imageStorageService;
    private readonly TimeProvider _timeProvider;

    public UpdateCompetitionCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IImageStorageService imageStorageService,
        TimeProvider timeProvider)
    {
        _context = context;
        _currentUserService = currentUserService;
        _imageStorageService = imageStorageService;
        _timeProvider = timeProvider;
    }

    public async Task<bool> Handle(UpdateCompetitionCommand request, CancellationToken cancellationToken)
    {
        var competitionToUpdate = await _context.Competitions
            .Include(c => c.Fishery) // Potrzebne do ewentualnej zmiany
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (competitionToUpdate == null)
        {
            throw new NotFoundException(nameof(Competition), request.Id.ToString());
        }

        var currentUser = await _currentUserService.GetOrProvisionDomainUserAsync(cancellationToken);
        if (competitionToUpdate.OrganizerId != currentUser?.Id)
        {
            throw new ForbiddenAccessException("Tylko organizator może edytować zawody.");
        }

        // Sprawdzenie, czy można edytować zawody na podstawie statusu
        if (!competitionToUpdate.CanModifyDetails()) // Używamy metody domenowej
        {
            throw new InvalidOperationException($"Nie można edytować zawodów w statusie '{competitionToUpdate.Status}'. Dozwolone statusy to Draft, AcceptingRegistrations, Scheduled.");
        }

        // Aktualizacja łowiska, jeśli się zmieniło
        if (competitionToUpdate.FisheryId != request.FisheryId)
        {
            var newFishery = await _context.Fisheries.FindAsync(new object[] { request.FisheryId }, cancellationToken)
                ?? throw new NotFoundException(nameof(Fishery), request.FisheryId.ToString());
            // competitionToUpdate.SetFishery(newFishery); // Zakładając metodę domenową lub bezpośrednie przypisanie
            // Na razie bezpośrednie, bo SetFishery nie było zdefiniowane w Competition.cs
            // To wymagałoby zmiany w Competition.cs, aby Fishery i FisheryId były public set
            // lub dedykowanej metody domenowej. Dla uproszczenia, zakładamy, że można to zmienić,
            // ale w praktyce encja Competition powinna kontrolować takie zmiany.
            // Lepsze podejście: metoda domenowa w Competition, która przyjmuje nowe FisheryId i obiekt Fishery.
        }


        string? newImageUrl = competitionToUpdate.ImageUrl;
        // string? currentImagePublicId = competitionToUpdate.ImagePublicId; // Jeśli przechowujemy

        if (request.RemoveCurrentImage && !string.IsNullOrEmpty(competitionToUpdate.ImageUrl))
        {
            // if (!string.IsNullOrEmpty(currentImagePublicId))
            // {
            //     await _imageStorageService.DeleteImageAsync(currentImagePublicId);
            // }
            newImageUrl = null;
            // competitionToUpdate.ClearImagePublicId(); // Metoda domenowa
        }

        if (request.Image != null && request.Image.Length > 0)
        {
            // if (!request.RemoveCurrentImage && !string.IsNullOrEmpty(currentImagePublicId))
            // {
            //     await _imageStorageService.DeleteImageAsync(currentImagePublicId);
            // }

            ImageUploadResult imageResult;
            await using (var memoryStream = new MemoryStream())
            {
                await request.Image.CopyToAsync(memoryStream, cancellationToken);
                memoryStream.Position = 0;
                imageResult = await _imageStorageService.UploadImageAsync(
                    memoryStream,
                    request.Image.FileName,
                    $"competitions/{currentUser.Id}");
            }

            if (!imageResult.Success || string.IsNullOrEmpty(imageResult.Url))
            {
                throw new ApplicationException($"Nie udało się przesłać nowego zdjęcia: {imageResult.ErrorMessage}");
            }
            newImageUrl = imageResult.Url;
            // competitionToUpdate.SetImagePublicId(imageResult.PublicId); // Metoda domenowa
        }

        // Convert to UTC to avoid PostgreSQL timezone issues
        var startTimeUtc = request.StartTime.ToUniversalTime();
        var endTimeUtc = request.EndTime.ToUniversalTime();
        var newSchedule = new DateTimeRange(startTimeUtc, endTimeUtc);

        // Używamy metody domenowej do aktualizacji
        competitionToUpdate.UpdateDetails(
            name: request.Name,
            schedule: newSchedule,
            type: request.Type,
            rules: request.Rules,
            imageUrl: newImageUrl
        );
        // Jeśli zmiana FisheryId jest dozwolona i zaimplementowana w UpdateDetails lub osobnej metodzie:
        // competitionToUpdate.UpdateFishery(newFishery);

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
