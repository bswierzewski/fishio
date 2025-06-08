namespace Fishio.Application.Competitions.Commands.ReopenRegistrations;

public class ReopenRegistrationsCommand : IRequest<bool>
{
    public int CompetitionId { get; set; }
}

public class ReopenRegistrationsCommandValidator : AbstractValidator<ReopenRegistrationsCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly TimeProvider _timeProvider;

    public ReopenRegistrationsCommandValidator(IApplicationDbContext context, TimeProvider timeProvider)
    {
        _context = context;
        _timeProvider = timeProvider;

        RuleFor(v => v.CompetitionId)
            .NotEmpty().WithMessage("ID zawodów jest wymagane.")
            .MustAsync(CompetitionCanReopenRegistrations).WithMessage("Nie można ponownie otworzyć rejestracji dla tych zawodów (np. nie istnieją, nie są w odpowiednim statusie lub czas rozpoczęcia już minął).");
    }

    private async Task<bool> CompetitionCanReopenRegistrations(int competitionId, CancellationToken cancellationToken)
    {
        var competition = await _context.Competitions
            .AsNoTracking()
            .Select(c => new { c.Id, c.Status, c.Schedule })
            .FirstOrDefaultAsync(c => c.Id == competitionId, cancellationToken);

        if (competition == null) return false;

        var now = _timeProvider.GetUtcNow();

        // Logika zgodna z metodą domenową Competition.ReopenRegistrations()
        return competition.Status == CompetitionStatus.Scheduled &&
               competition.Schedule.Start > now;
    }
}