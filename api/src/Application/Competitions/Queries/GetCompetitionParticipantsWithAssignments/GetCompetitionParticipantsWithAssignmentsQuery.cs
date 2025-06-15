namespace Fishio.Application.Competitions.Queries.GetCompetitionParticipantsWithAssignments;

public class GetCompetitionParticipantsWithAssignmentsQuery : IRequest<CompetitionParticipantsWithAssignmentsDto>
{
    public int CompetitionId { get; set; }
}

public class GetCompetitionParticipantsWithAssignmentsQueryValidator : AbstractValidator<GetCompetitionParticipantsWithAssignmentsQuery>
{
    public GetCompetitionParticipantsWithAssignmentsQueryValidator()
    {
        RuleFor(v => v.CompetitionId)
            .NotEmpty().WithMessage("ID zawodów jest wymagane.");
    }
}

// --- DTO ---
public record CompetitionParticipantsWithAssignmentsDto
{
    public int CompetitionId { get; init; }
    public string CompetitionName { get; init; } = string.Empty;
    public bool CanManageAssignments { get; init; }
    public List<ParticipantWithAssignmentDto> Participants { get; init; } = [];
    public List<string> UsedSectors { get; init; } = [];
    public List<string> UsedStands { get; init; } = [];
}

public record ParticipantWithAssignmentDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Email { get; init; }
    public string? Sector { get; init; }
    public string? Stand { get; init; }
    public bool IsGuest { get; init; }
}