namespace Fishio.Application.Competitions.Queries.GetCompetitionCatches;

public record CompetitionFishCatchDto
{
    public int Id { get; init; }
    public int CompetitionId { get; init; }
    public int ParticipantId { get; init; }
    public string ParticipantName { get; init; } = string.Empty;
    public int JudgeId { get; init; }
    public string JudgeName { get; init; } = string.Empty;
    public int? FishSpeciesId { get; init; }
    public string? FishSpeciesName { get; init; }
    public string? FishSpeciesImageUrl { get; init; }
    public decimal? LengthInCm { get; init; }
    public decimal? WeightInKg { get; init; }
    public DateTimeOffset CatchTime { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset LastModifiedAt { get; init; }
}