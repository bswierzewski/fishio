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
            .NotEmpty().WithMessage("ID zawodów jest wymagane.");
    }
}