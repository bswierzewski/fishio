using MediatR;

namespace Fishio.IntegrationEvents.Venues;

public record DummyVenueEvent(
    Guid VenueId,
    string VenueName,
    DateTime OccurredOn) : INotification;