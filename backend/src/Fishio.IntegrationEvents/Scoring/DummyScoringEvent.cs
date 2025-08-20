using MediatR;

namespace Fishio.IntegrationEvents.Scoring;

public record DummyScoringEvent(
    Guid ScoreId,
    int Points,
    DateTime OccurredOn) : INotification;