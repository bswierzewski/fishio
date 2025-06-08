namespace Fishio.Application.Competitions.Commands.StartCompetition;

public class StartCompetitionCommand : IRequest<bool>
{
    public int CompetitionId { get; set; }
}

public class StartCompetitionCommandValidator : AbstractValidator<StartCompetitionCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly TimeProvider _timeProvider;

    public StartCompetitionCommandValidator(IApplicationDbContext context, TimeProvider timeProvider)
    {
        _context = context;
        _timeProvider = timeProvider;

        RuleFor(v => v.CompetitionId)
            .NotEmpty().WithMessage("ID zawodów jest wymagane.")
            .MustAsync(CompetitionCanBeStarted).WithMessage("Zawody nie mogą zostać rozpoczęte (np. nie istnieją, nie są w odpowiednim statusie lub czas rozpoczęcia jeszcze nie nadszedł).");
    }

    private async Task<bool> CompetitionCanBeStarted(int competitionId, CancellationToken cancellationToken)
    {
        var competition = await _context.Competitions
            .AsNoTracking() // Tylko do odczytu dla walidacji
            .Select(c => new { c.Id, c.Status, c.Schedule })
            .FirstOrDefaultAsync(c => c.Id == competitionId, cancellationToken);

        if (competition == null) return false;

        var now = _timeProvider.GetUtcNow();

        // Logika zgodna z metodą domenową Competition.StartCompetition()
        return competition.Status == CompetitionStatus.Scheduled &&
               now >= competition.Schedule.Start &&
               now <= competition.Schedule.End;
    }
}
