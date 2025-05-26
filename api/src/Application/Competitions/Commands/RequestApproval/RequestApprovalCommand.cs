namespace Fishio.Application.Competitions.Commands.RequestApproval;

public class RequestApprovalCommand : IRequest<bool>
{
    public int CompetitionId { get; set; }
}

public class RequestApprovalCommandValidator : AbstractValidator<RequestApprovalCommand>
{
    private readonly IApplicationDbContext _context;

    public RequestApprovalCommandValidator(IApplicationDbContext context)
    {
        _context = context;

        RuleFor(v => v.CompetitionId)
            .NotEmpty().WithMessage("ID zawodów jest wymagane.")
            .MustAsync(CompetitionCanRequestApproval).WithMessage("Nie można złożyć wniosku o zatwierdzenie dla tych zawodów (np. nie istnieją, nie są w statusie Draft lub nie mają aktywnej kategorii głównej).");
    }

    private async Task<bool> CompetitionCanRequestApproval(int competitionId, CancellationToken cancellationToken)
    {
        var competition = await _context.Competitions
            .AsNoTracking()
            .Include(c => c.Categories)
            .Select(c => new { c.Id, c.Status, Categories = c.Categories.Where(cat => cat.IsEnabled && cat.IsPrimaryScoring) })
            .FirstOrDefaultAsync(c => c.Id == competitionId, cancellationToken);

        if (competition == null) return false;

        // Logika zgodna z metodą domenową Competition.RequestApproval()
        return competition.Status == CompetitionStatus.Draft &&
               competition.Categories.Any();
    }
}