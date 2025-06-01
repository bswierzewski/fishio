namespace Fishio.Application.Fisheries.Commands.CreateFishery;

public class CreateFisheryCommandHandler : IRequestHandler<CreateFisheryCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CreateFisheryCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<int> Handle(CreateFisheryCommand request, CancellationToken cancellationToken)
    {
        var currentUser = await _currentUserService.GetOrProvisionDomainUserAsync(cancellationToken);
        if (currentUser == null || currentUser.Id == 0)
        {
            throw new UnauthorizedAccessException("Użytkownik musi być zalogowany, aby dodać łowisko.");
        }

        // Create the fishery with the provided image URL (if any)
        var fishery = new Fishery(
            currentUser.Id,
            request.Name,
            request.Location,
            request.ImageUrl);

        // Add fish species if provided
        if (request.FishSpeciesIds.Any())
        {
            var fishSpecies = await _context.FishSpecies
                .Where(fs => request.FishSpeciesIds.Contains(fs.Id))
                .ToListAsync(cancellationToken);

            foreach (var species in fishSpecies)
            {
                fishery.AddSpecies(species);
            }
        }

        _context.Fisheries.Add(fishery);
        await _context.SaveChangesAsync(cancellationToken);

        return fishery.Id;
    }
}