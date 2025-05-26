namespace Fishio.Application.Competitions.Commands.ScheduleCompetition;

public class ScheduleCompetitionCommand : IRequest<bool>
{
    public int CompetitionId { get; set; }
}

public class ScheduleCompetitionCommandValidator : AbstractValidator<ScheduleCompetitionCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly TimeProvider _timeProvider;

    public ScheduleCompetitionCommandValidator(IApplicationDbContext context, TimeProvider timeProvider)
    {
        _context = context;
        _timeProvider = timeProvider;

        RuleFor(v => v.CompetitionId)
            .NotEmpty().WithMessage("ID zawodów jest wymagane.")
            .MustAsync(CompetitionCanBeScheduled).WithMessage("Nie można zaplanować tych zawodów (np. nie istnieją, nie są w statusie AcceptingRegistrations lub czas rozpoczęcia już minął).");
    }

    private async Task<bool> CompetitionCanBeScheduled(int competitionId, CancellationToken cancellationToken)
    {
        var competition = await _context.Competitions
            .AsNoTracking()
            .Select(c => new { c.Id, c.Status, c.Schedule })
            .FirstOrDefaultAsync(c => c.Id == competitionId, cancellationToken);

        if (competition == null) return false;

        var now = _timeProvider.GetUtcNow();

        // Logika zgodna z metodą domenową Competition.ScheduleCompetition()
        return competition.Status == CompetitionStatus.AcceptingRegistrations &&
               competition.Schedule.Start > now;
    }
}