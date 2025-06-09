namespace Fishio.Application.Competitions.Commands.DeleteFishCatch;

public class DeleteCompetitionFishCatchCommand : IRequest<bool>
{
    public int CompetitionId { get; set; }
    public int FishCatchId { get; set; }

    public DeleteCompetitionFishCatchCommand(int competitionId, int fishCatchId)
    {
        CompetitionId = competitionId;
        FishCatchId = fishCatchId;
    }
}

public class DeleteCompetitionFishCatchCommandValidator : AbstractValidator<DeleteCompetitionFishCatchCommand>
{
    public DeleteCompetitionFishCatchCommandValidator()
    {
        RuleFor(v => v.CompetitionId)
            .NotEmpty().WithMessage("ID zawodów jest wymagane.");

        RuleFor(v => v.FishCatchId)
            .NotEmpty().WithMessage("ID połowu jest wymagane.");
    }
}