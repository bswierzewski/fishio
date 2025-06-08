namespace Fishio.Application.Competitions.Commands.OpenRegistrations;

public class OpenRegistrationsCommand : IRequest<bool>
{
    public int CompetitionId { get; set; }
}

public class OpenRegistrationsCommandValidator : AbstractValidator<OpenRegistrationsCommand>
{
    private readonly IApplicationDbContext _context;

    public OpenRegistrationsCommandValidator(IApplicationDbContext context)
    {
        _context = context;

        RuleFor(v => v.CompetitionId)
            .NotEmpty().WithMessage("ID zawodów jest wymagane.")
            .MustAsync(CompetitionCanOpenRegistrations).WithMessage("Zawody nie istnieją.");
    }

    private async Task<bool> CompetitionCanOpenRegistrations(int competitionId, CancellationToken cancellationToken)
    {
        var competition = await _context.Competitions
            .AsNoTracking()
            .Include(c => c.Categories)
            .Select(c => new { c.Id, c.Status, Categories = c.Categories.Where(cat => cat.IsEnabled && cat.IsPrimaryScoring) })
            .FirstOrDefaultAsync(c => c.Id == competitionId, cancellationToken);

        return competition != null;
    }
}