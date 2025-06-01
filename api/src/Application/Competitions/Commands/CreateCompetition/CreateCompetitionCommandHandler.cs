using Fishio.Domain.ValueObjects; // Dla DateTimeRange

namespace Fishio.Application.Competitions.Commands.CreateCompetition;

public class CreateCompetitionCommandHandler : IRequestHandler<CreateCompetitionCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CreateCompetitionCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
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

        // Convert to UTC to avoid PostgreSQL timezone issues
        var startTimeUtc = request.StartTime.ToUniversalTime();
        var endTimeUtc = request.EndTime.ToUniversalTime();
        var schedule = new DateTimeRange(startTimeUtc, endTimeUtc);

        var competition = new Competition(
            name: request.Name,
            schedule: schedule,
            type: request.Type,
            organizer: currentUser,
            fishery: fishery,
            rules: request.Rules,
            imageUrl: request.ImageUrl); // Use the provided image URL

        // Dodaj główną kategorię punktacyjną
        var primaryCategoryDefinition = await _context.CategoryDefinitions
            .FindAsync(new object[] { request.PrimaryScoringCategoryDefinitionId }, cancellationToken);

        if (primaryCategoryDefinition == null)
        {
            throw new NotFoundException(nameof(CategoryDefinition), request.PrimaryScoringCategoryDefinitionId.ToString());
        }

        competition.AddCategory(
            categoryDefinition: primaryCategoryDefinition,
            isPrimaryScoring: true,
            fishSpeciesId: request.PrimaryScoringFishSpeciesId,
            customNameOverride: null);

        // Dodaj kategorie specjalne, jeśli są
        if (request.SpecialCategories != null && request.SpecialCategories.Any())
        {
            int sortOrder = 1;
            foreach (var specialCategoryDto in request.SpecialCategories)
            {
                var specialCategoryDefinition = await _context.CategoryDefinitions
                    .FindAsync(new object[] { specialCategoryDto.CategoryDefinitionId }, cancellationToken);

                if (specialCategoryDefinition == null)
                {
                    throw new NotFoundException(nameof(CategoryDefinition), specialCategoryDto.CategoryDefinitionId.ToString());
                }

                competition.AddCategory(
                    categoryDefinition: specialCategoryDefinition,
                    isPrimaryScoring: false,
                    sortOrder: sortOrder++,
                    fishSpeciesId: specialCategoryDto.FishSpeciesId,
                    customNameOverride: specialCategoryDto.CustomNameOverride);
            }
        }

        _context.Competitions.Add(competition);
        await _context.SaveChangesAsync(cancellationToken);

        return competition.Id;
    }
}
