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

        // Check if user is a judge or organizer (both can register catches)
        var judgeParticipantEntry = competition.Participants
            .FirstOrDefault(p => p.UserId == currentUser.Id &&
                (p.Role == ParticipantRole.Judge || p.Role == ParticipantRole.Organizer));

        var isOrganizer = competition.OrganizerId == currentUser.Id;

        if (judgeParticipantEntry == null && !isOrganizer)
        {
            throw new ForbiddenAccessException("Tylko wyznaczony sędzia lub organizator może rejestrować połowy w tych zawodach.");
        }

        var participantToCredit = competition.Participants
            .FirstOrDefault(p => p.Id == request.ParticipantEntryId && p.Role == ParticipantRole.Competitor);
        if (participantToCredit == null)
        {
            throw new NotFoundException("Wybrany uczestnik nie został znaleziony w tych zawodach lub nie jest zawodnikiem/gościem.", request.ParticipantEntryId.ToString());
        }

        FishSpecies? fishSpecies = null;
        if (request.FishSpeciesId.HasValue)
        {
            fishSpecies = await _context.FishSpecies.FindAsync(new object[] { request.FishSpeciesId.Value }, cancellationToken)
                ?? throw new NotFoundException(nameof(FishSpecies), request.FishSpeciesId.Value.ToString());
        }

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
