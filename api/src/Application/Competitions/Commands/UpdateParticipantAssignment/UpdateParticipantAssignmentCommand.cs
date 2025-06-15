namespace Fishio.Application.Competitions.Commands.UpdateParticipantAssignment;

public class UpdateParticipantAssignmentCommand : IRequest<bool>
{
    public int CompetitionId { get; set; }
    public int ParticipantId { get; set; }
    public string? Sector { get; set; }
    public string? Stand { get; set; }
}

public class UpdateParticipantAssignmentCommandValidator : AbstractValidator<UpdateParticipantAssignmentCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateParticipantAssignmentCommandValidator(IApplicationDbContext context)
    {
        _context = context;

        RuleFor(v => v.CompetitionId)
            .NotEmpty().WithMessage("ID zawodów jest wymagane.");

        RuleFor(v => v.ParticipantId)
            .NotEmpty().WithMessage("ID uczestnika jest wymagane.")
            .MustAsync(ParticipantBelongsToCompetition).WithMessage("Uczestnik nie należy do podanych zawodów.");

        RuleFor(v => v.Sector)
            .MaximumLength(100).WithMessage("Nazwa sektora nie może przekraczać 100 znaków.");

        RuleFor(v => v.Stand)
            .MaximumLength(50).WithMessage("Nazwa stanowiska nie może przekraczać 50 znaków.");
    }

    private async Task<bool> ParticipantBelongsToCompetition(UpdateParticipantAssignmentCommand command, int participantId, CancellationToken cancellationToken)
    {
        return await _context.CompetitionParticipants
            .AsNoTracking()
            .AnyAsync(p => p.Id == participantId &&
                          p.CompetitionId == command.CompetitionId &&
                          p.Role == ParticipantRole.Competitor &&
                          p.Status == ParticipantStatus.Approved, cancellationToken);
    }
}