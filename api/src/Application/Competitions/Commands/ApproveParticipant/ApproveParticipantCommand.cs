namespace Fishio.Application.Competitions.Commands.ApproveParticipant;

public class ApproveParticipantCommand : IRequest
{
    public int CompetitionId { get; set; }
    public int ParticipantId { get; set; }
}

public class ApproveParticipantCommandValidator : AbstractValidator<ApproveParticipantCommand>
{
    public ApproveParticipantCommandValidator()
    {
        RuleFor(v => v.CompetitionId)
            .NotEmpty().WithMessage("ID zawodów jest wymagane.");

        RuleFor(v => v.ParticipantId)
            .NotEmpty().WithMessage("ID uczestnika jest wymagane.");
    }
}