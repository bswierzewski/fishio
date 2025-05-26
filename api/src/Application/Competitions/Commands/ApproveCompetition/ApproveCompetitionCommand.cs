namespace Fishio.Application.Competitions.Commands.ApproveCompetition;

public class ApproveCompetitionCommand : IRequest<bool>
{
    public int CompetitionId { get; set; }
}

public class ApproveCompetitionCommandValidator : AbstractValidator<ApproveCompetitionCommand>
{
    private readonly IApplicationDbContext _context;

    public ApproveCompetitionCommandValidator(IApplicationDbContext context)
    {
        _context = context;

        RuleFor(v => v.CompetitionId)
            .NotEmpty().WithMessage("ID zawodów jest wymagane.")
            .MustAsync(CompetitionCanBeApproved).WithMessage("Nie można zatwierdzić tych zawodów (np. nie istnieją lub nie są w statusie PendingApproval).");
    }

    private async Task<bool> CompetitionCanBeApproved(int competitionId, CancellationToken cancellationToken)
    {
        var competition = await _context.Competitions
            .AsNoTracking()
            .Select(c => new { c.Id, c.Status })
            .FirstOrDefaultAsync(c => c.Id == competitionId, cancellationToken);

        if (competition == null) return false;

        return competition.Status == CompetitionStatus.PendingApproval;
    }
}