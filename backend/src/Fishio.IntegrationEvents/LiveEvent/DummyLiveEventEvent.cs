using MediatR;

namespace Fishio.IntegrationEvents.LiveEvent;

public record DummyLiveEventEvent(
    Guid EventId,
    string EventType,
    DateTime OccurredOn) : INotification;