using Fishio.Application.Common.Exceptions;

namespace Fishio.Application.Fisheries.Commands.UpdateFishery;

public class UpdateFisheryCommandHandler : IRequestHandler<UpdateFisheryCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateFisheryCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(UpdateFisheryCommand request, CancellationToken cancellationToken)
    {
        var fisheryToUpdate = await _context.Fisheries
            .Include(f => f.FishSpecies) // Załaduj obecne gatunki do modyfikacji
            .FirstOrDefaultAsync(f => f.Id == request.Id, cancellationToken);

        if (fisheryToUpdate == null)
        {
            throw new NotFoundException(nameof(Fishery), request.Id.ToString());
        }

        var currentUser = await _currentUserService.GetOrProvisionDomainUserAsync(cancellationToken);
        // Sprawdzenie uprawnień: tylko twórca łowiska lub administrator może je edytować
        // (Zakładamy, że administrator miałby specjalną rolę/claim, tu uproszczenie)
        if (fisheryToUpdate.UserId != currentUser?.Id /* && !currentUser.IsAdmin */)
        {
            throw new ForbiddenAccessException();
        }

        string? newImageUrl = fisheryToUpdate.ImageUrl; // Domyślnie stary URL

        if (request.RemoveCurrentImage && !string.IsNullOrEmpty(fisheryToUpdate.ImageUrl))
        {
            // TODO: Implementacja logiki usuwania starego zdjęcia z Cloudinary
            // Potrzebny byłby PublicId zdjęcia, jeśli Cloudinary go zwraca i jest przechowywany.
            // Na razie zakładamy, że usunięcie oznacza wyczyszczenie ImageUrl.
            newImageUrl = null;
        }

        if (!string.IsNullOrEmpty(request.ImageUrl))
        {
            // Use the provided image URL
            newImageUrl = request.ImageUrl;
        }

        // Aktualizuj podstawowe informacje
        fisheryToUpdate.UpdateDetails(request.Name, request.Location, newImageUrl);

        // Aktualizuj gatunki ryb
        if (request.FishSpeciesIds != null && request.FishSpeciesIds.Any())
        {
            // Usuń wszystkie obecne gatunki
            var existingSpecies = fisheryToUpdate.FishSpecies.ToList();
            foreach (var species in existingSpecies)
            {
                fisheryToUpdate.RemoveSpecies(species);
            }

            // Dodaj nowe gatunki
            var fishSpecies = await _context.FishSpecies
                .Where(fs => request.FishSpeciesIds.Contains(fs.Id))
                .ToListAsync(cancellationToken);

            foreach (var species in fishSpecies)
            {
                fisheryToUpdate.AddSpecies(species);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
