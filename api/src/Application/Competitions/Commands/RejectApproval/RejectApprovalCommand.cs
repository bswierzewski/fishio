namespace Fishio.Application.Competitions.Commands.RejectApproval;

public class RejectApprovalCommand : IRequest<bool>
{
    public int CompetitionId { get; set; }
    public string Reason { get; set; } = string.Empty;
}

public class RejectApprovalCommandValidator : AbstractValidator<RejectApprovalCommand>
{
    private readonly IApplicationDbContext _context;

    public RejectApprovalCommandValidator(IApplicationDbContext context)
    {
        _context = context;

        RuleFor(v => v.CompetitionId)
            .NotEmpty().WithMessage("ID zawodów jest wymagane.")
            .MustAsync(CompetitionCanBeRejected).WithMessage("Nie można odrzucić zatwierdzenia tych zawodów (np. nie istnieją lub nie są w statusie PendingApproval).");

        RuleFor(v => v.Reason)
            .NotEmpty().WithMessage("Powód odrzucenia jest wymagany.")
            .MaximumLength(500).WithMessage("Powód odrzucenia nie może przekraczać 500 znaków.");
    }

    private async Task<bool> CompetitionCanBeRejected(int competitionId, CancellationToken cancellationToken)
    {
        var competition = await _context.Competitions
            .AsNoTracking()
            .Select(c => new { c.Id, c.Status })
            .FirstOrDefaultAsync(c => c.Id == competitionId, cancellationToken);

        if (competition == null) return false;

        return competition.Status == CompetitionStatus.PendingApproval;
    }
}