using FluentValidation;

namespace Fishio.Application.Competitions.Commands.SetToDraft;

public class SetToDraftCommandValidator : AbstractValidator<SetToDraftCommand>
{
    public SetToDraftCommandValidator()
    {
        RuleFor(x => x.CompetitionId)
            .GreaterThan(0).WithMessage("ID zawodów jest wymagane.");

        RuleFor(x => x.Reason)
            .MaximumLength(500).WithMessage("Powód nie może przekraczać 500 znaków.");
    }
}