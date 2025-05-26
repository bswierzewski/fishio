namespace Fishio.Application.Competitions.Commands.SetUpcoming;

public class SetUpcomingCommand : IRequest<bool>
{
    public int CompetitionId { get; set; }
}

public class SetUpcomingCommandValidator : AbstractValidator<SetUpcomingCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly TimeProvider _timeProvider;

    public SetUpcomingCommandValidator(IApplicationDbContext context, TimeProvider timeProvider)
    {
        _context = context;
        _timeProvider = timeProvider;

        RuleFor(v => v.CompetitionId)
            .NotEmpty().WithMessage("ID zawodów jest wymagane.")
            .MustAsync(CompetitionCanBeSetUpcoming).WithMessage("Nie można ustawić statusu 'Upcoming' dla tych zawodów (np. nie istnieją, nie są w statusie Scheduled lub do rozpoczęcia zostało więcej niż 24 godziny).");
    }

    private async Task<bool> CompetitionCanBeSetUpcoming(int competitionId, CancellationToken cancellationToken)
    {
        var competition = await _context.Competitions
            .AsNoTracking()
            .Select(c => new { c.Id, c.Status, c.Schedule })
            .FirstOrDefaultAsync(c => c.Id == competitionId, cancellationToken);

        if (competition == null) return false;

        var now = _timeProvider.GetUtcNow();
        var timeUntilStart = competition.Schedule.Start - now;

        // Logika zgodna z metodą domenową Competition.SetUpcoming()
        return competition.Status == CompetitionStatus.Scheduled &&
               timeUntilStart.TotalHours <= 24;
    }
}