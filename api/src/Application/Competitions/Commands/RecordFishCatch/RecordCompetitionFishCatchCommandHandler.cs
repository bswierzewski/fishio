using Fishio.Application.Common.Exceptions;
using Fishio.Domain.ValueObjects;

namespace Fishio.Application.Competitions.Commands.RecordFishCatch;

public class RecordCompetitionFishCatchCommandHandler : IRequestHandler<RecordCompetitionFishCatchCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public RecordCompetitionFishCatchCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<int> Handle(RecordCompetitionFishCatchCommand request, CancellationToken cancellationToken)
    {
        var currentUser = await _currentUserService.GetOrProvisionDomainUserAsync(cancellationToken);
        if (currentUser == null || currentUser.Id == 0)
        {
            throw new UnauthorizedAccessException("Użytkownik musi być zalogowany, aby zarejestrować połów.");
        }

        var competition = await _context.Competitions
            .Include(c => c.Participants) // Potrzebne do znalezienia sędziego i uczestnika
            .Include(c => c.FishCatches) // Potrzebne do metody domenowej RecordFishCatch
            .FirstOrDefaultAsync(c => c.Id == request.CompetitionId, cancellationToken);

        if (competition == null)
        {
            throw new NotFoundException(nameof(Competition), request.CompetitionId.ToString());
        }

        var judgeParticipantEntry = competition.Participants
            .FirstOrDefault(p => p.UserId == currentUser.Id && p.Role == ParticipantRole.Judge);

        if (judgeParticipantEntry == null)
        {
            throw new ForbiddenAccessException("Tylko wyznaczony sędzia może rejestrować połowy w tych zawodach.");
        }

        var participantToCredit = competition.Participants
            .FirstOrDefault(p => p.Id == request.ParticipantEntryId && p.Role == ParticipantRole.Competitor);
        if (participantToCredit == null)
        {
            throw new NotFoundException("Wybrany uczestnik nie został znaleziony w tych zawodach lub nie jest zawodnikiem/gościem.", request.ParticipantEntryId.ToString());
        }

        var fishSpecies = await _context.FishSpecies.FindAsync(new object[] { request.FishSpeciesId }, cancellationToken)
            ?? throw new NotFoundException(nameof(FishSpecies), request.FishSpeciesId.ToString());

        // Use the provided image URL directly
        string imageUrl = request.ImageUrl;

        FishLength? length = request.LengthInCm.HasValue ? new FishLength(request.LengthInCm.Value) : null;
        FishWeight? weight = request.WeightInKg.HasValue ? new FishWeight(request.WeightInKg.Value) : null;

        // Convert to UTC to avoid PostgreSQL timezone issues
        var catchTimeUtc = request.CatchTime.ToUniversalTime();

        // Używamy metody domenowej Competition.RecordFishCatch
        try
        {
            var fishCatchEntry = competition.RecordFishCatch(
                participant: participantToCredit,
                judge: currentUser, // Przekazujemy encję User sędziego
                fishSpecies: fishSpecies,
                imageUrl: imageUrl,
                catchTime: catchTimeUtc,
                length: length,
                weight: weight
            );

            await _context.SaveChangesAsync(cancellationToken);
            return fishCatchEntry.Id;
        }
        catch (InvalidOperationException ex) // Np. jeśli zawody nie trwają
        {
            throw new ApplicationException($"Nie można zarejestrować połowu: {ex.Message}", ex);
        }
    }
}
