namespace Fishio.Application.Competitions.Commands.RejectParticipant;

public class RejectParticipantCommand : IRequest
{
    public int CompetitionId { get; set; }
    public int ParticipantId { get; set; }
}

public class RejectParticipantCommandValidator : AbstractValidator<RejectParticipantCommand>
{
    public RejectParticipantCommandValidator()
    {
        RuleFor(v => v.CompetitionId)
            .NotEmpty().WithMessage("ID zawodów jest wymagane.");

        RuleFor(v => v.ParticipantId)
            .NotEmpty().WithMessage("ID uczestnika jest wymagane.");
    }
}