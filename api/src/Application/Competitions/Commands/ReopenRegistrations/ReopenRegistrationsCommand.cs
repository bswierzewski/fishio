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
            .MustAsync(CompetitionCanReopenRegistrations).WithMessage("Zawody nie istnieją.");
    }

    private async Task<bool> CompetitionCanReopenRegistrations(int competitionId, CancellationToken cancellationToken)
    {
        var competition = await _context.Competitions
            .AsNoTracking()
            .Select(c => new { c.Id, c.Status, c.Schedule })
            .FirstOrDefaultAsync(c => c.Id == competitionId, cancellationToken);

        return competition != null;
    }
}