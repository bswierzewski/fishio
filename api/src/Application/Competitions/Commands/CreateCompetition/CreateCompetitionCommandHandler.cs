using Application.Common.Interfaces.Services;
using Fishio.Domain.ValueObjects; // Dla DateTimeRange

namespace Fishio.Application.Competitions.Commands.CreateCompetition;

public class CreateCompetitionCommandHandler : IRequestHandler<CreateCompetitionCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IImageStorageService _imageStorageService;
    private readonly ICompetitionTokenGenerator _tokenGenerator; // Do generowania ResultsToken

    public CreateCompetitionCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IImageStorageService imageStorageService,
        ICompetitionTokenGenerator tokenGenerator)
    {
        _context = context;
        _currentUserService = currentUserService;
        _imageStorageService = imageStorageService;
        _tokenGenerator = tokenGenerator;
    }

    public async Task<int> Handle(CreateCompetitionCommand request, CancellationToken cancellationToken)
    {
        var currentUser = await _currentUserService.GetOrProvisionDomainUserAsync(cancellationToken);
        if (currentUser == null || currentUser.Id == 0)
        {
            throw new UnauthorizedAccessException("Użytkownik musi być zalogowany, aby utworzyć zawody.");
        }

        var fishery = await _context.Fisheries.FindAsync(new object[] { request.FisheryId }, cancellationToken);
        if (fishery == null)
        {
            throw new NotFoundException(nameof(Fishery), request.FisheryId.ToString());
        }

        string? imageUrl = null;
        // string? imagePublicId = null; // Jeśli będziemy przechowywać PublicId
        if (request.Image != null && request.Image.Length > 0)
        {
            ImageUploadResult imageResult;
            await using (var memoryStream = new MemoryStream())
            {
                await request.Image.CopyToAsync(memoryStream, cancellationToken);
                memoryStream.Position = 0;
                imageResult = await _imageStorageService.UploadImageAsync(
                    memoryStream,
                    request.Image.FileName,
                    $"competitions/{currentUser.Id}"); // Przykładowy folder
            }

            if (!imageResult.Success || string.IsNullOrEmpty(imageResult.Url))
            {
                throw new ApplicationException($"Nie udało się przesłać zdjęcia dla zawodów: {imageResult.ErrorMessage}");
            }
            imageUrl = imageResult.Url;
            // imagePublicId = imageResult.PublicId;
        }

        // Convert to UTC to avoid PostgreSQL timezone issues
        var startTimeUtc = request.StartTime.ToUniversalTime();
        var endTimeUtc = request.EndTime.ToUniversalTime();
        var schedule = new DateTimeRange(startTimeUtc, endTimeUtc);

        var resultsToken = _tokenGenerator.GenerateUniqueToken(); // Używamy serwisu do generowania tokenu

        var competition = new Competition(
            name: request.Name,
            schedule: schedule,
            type: request.Type,
            organizer: currentUser, // Przekazujemy całą encję User
            fishery: fishery,       // Przekazujemy całą encję Fishery
            rules: request.Rules,
            imageUrl: imageUrl
        // ImagePublicId = imagePublicId // Jeśli dodane do encji Competition
        );
        // ResultsToken jest ustawiany w konstruktorze Competition, ale możemy go nadpisać, jeśli tokenGenerator jest preferowany
        // competition.UpdateResultsToken(resultsToken); // Jeśli metoda domenowa istnieje

        // Dodawanie głównej kategorii punktacyjnej
        var primaryCategoryDefinition = await _context.CategoryDefinitions.FindAsync(new object[] { request.PrimaryScoringCategoryDefinitionId }, cancellationToken)
            ?? throw new NotFoundException(nameof(CategoryDefinition), request.PrimaryScoringCategoryDefinitionId.ToString());

        FishSpecies? primaryCategoryFishSpecies = null;
        if (request.PrimaryScoringFishSpeciesId.HasValue)
        {
            primaryCategoryFishSpecies = await _context.FishSpecies.FindAsync(new object[] { request.PrimaryScoringFishSpeciesId.Value }, cancellationToken)
                ?? throw new NotFoundException(nameof(FishSpecies), request.PrimaryScoringFishSpeciesId.Value.ToString());
        }

        // Używamy metody domenowej Competition.AddCategory
        competition.AddCategory(
            categoryDefinition: primaryCategoryDefinition,
            isPrimaryScoring: true,
            fishSpeciesId: primaryCategoryFishSpecies?.Id, // Przekazujemy ID, jeśli istnieje
            maxWinnersToDisplay: 3 // Domyślnie np. 3 dla głównej kategorii
        );


        // Dodawanie kategorii specjalnych
        if (request.SpecialCategories != null)
        {
            int sortOrder = 1;
            foreach (var specCatDto in request.SpecialCategories)
            {
                var categoryDefinition = await _context.CategoryDefinitions.FindAsync(new object[] { specCatDto.CategoryDefinitionId }, cancellationToken)
                    ?? throw new NotFoundException(nameof(CategoryDefinition), specCatDto.CategoryDefinitionId.ToString());

                FishSpecies? specialCategoryFishSpecies = null;
                if (specCatDto.FishSpeciesId.HasValue)
                {
                    specialCategoryFishSpecies = await _context.FishSpecies.FindAsync(new object[] { specCatDto.FishSpeciesId.Value }, cancellationToken)
                        ?? throw new NotFoundException(nameof(FishSpecies), specCatDto.FishSpeciesId.Value.ToString());
                }

                competition.AddCategory(
                    categoryDefinition: categoryDefinition,
                    isPrimaryScoring: false,
                    sortOrder: sortOrder++,
                    fishSpeciesId: specialCategoryFishSpecies?.Id,
                    customNameOverride: specCatDto.CustomNameOverride,
                    maxWinnersToDisplay: 1 // Domyślnie 1 dla specjalnych
                );
            }
        }

        // ResultsToken jest już generowany w konstruktorze Competition, jeśli tak zdefiniowano.
        // Jeśli ICompetitionTokenGenerator ma być głównym źródłem:
        // competition.SetResultsToken(resultsToken); // Zakładając, że istnieje taka metoda domenowa

        _context.Competitions.Add(competition);
        await _context.SaveChangesAsync(cancellationToken); // Interceptory zajmą się Created, CreatedBy itp.

        return competition.Id;
    }
}
