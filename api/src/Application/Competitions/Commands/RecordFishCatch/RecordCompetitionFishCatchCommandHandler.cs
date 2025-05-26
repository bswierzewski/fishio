using Application.Common.Interfaces.Services;
using Fishio.Application.Common.Exceptions;
using Fishio.Domain.ValueObjects;

namespace Fishio.Application.Competitions.Commands.RecordFishCatch;

public class RecordCompetitionFishCatchCommandHandler : IRequestHandler<RecordCompetitionFishCatchCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IImageStorageService _imageStorageService;

    public RecordCompetitionFishCatchCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IImageStorageService imageStorageService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _imageStorageService = imageStorageService;
    }

    public async Task<int> Handle(RecordCompetitionFishCatchCommand request, CancellationToken cancellationToken)
    {
        var competition = await _context.Competitions
            .Include(c => c.Participants) // Potrzebne do znalezienia sędziego i uczestnika
            .Include(c => c.FishCatches) // Potrzebne do metody domenowej RecordFishCatch
            .FirstOrDefaultAsync(c => c.Id == request.CompetitionId, cancellationToken);

        if (competition == null)
        {
            throw new NotFoundException(nameof(Competition), request.CompetitionId.ToString());
        }

        var judgeUser = await _currentUserService.GetOrProvisionDomainUserAsync(cancellationToken);
        if (judgeUser == null || judgeUser.Id == 0)
        {
            throw new UnauthorizedAccessException("Sędzia musi być zalogowany.");
        }

        // Sprawdzenie, czy aktualny użytkownik jest sędzią w tych zawodach
        var judgeParticipantEntry = competition.Participants
            .FirstOrDefault(p => p.UserId == judgeUser.Id && p.Role == ParticipantRole.Judge);

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

        ImageUploadResult imageResult;
        await using (var memoryStream = new MemoryStream())
        {
            await request.Image.CopyToAsync(memoryStream, cancellationToken);
            memoryStream.Position = 0;
            imageResult = await _imageStorageService.UploadImageAsync(
                memoryStream,
                request.Image.FileName,
                $"competitions/{competition.Id}/catches");
        }

        if (!imageResult.Success || string.IsNullOrEmpty(imageResult.Url))
        {
            throw new ApplicationException($"Nie udało się przesłać zdjęcia połowu: {imageResult.ErrorMessage}");
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
                judge: judgeUser, // Przekazujemy encję User sędziego
                fishSpecies: fishSpecies,
                imageUrl: imageResult.Url,
                // imagePublicId: imageResult.PublicId, // Jeśli przechowujemy
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
