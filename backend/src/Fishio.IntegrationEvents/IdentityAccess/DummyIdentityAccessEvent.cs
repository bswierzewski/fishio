using MediatR;

namespace Fishio.IntegrationEvents.IdentityAccess;

public record DummyIdentityAccessEvent(
    Guid UserId,
    string Email,
    DateTime OccurredOn) : INotification;