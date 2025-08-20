using MediatR;

namespace Fishio.IntegrationEvents.Competitions;

public record DummyCompetitionEvent(
    Guid Id,
    string Name,
    DateTime OccurredOn) : INotification;