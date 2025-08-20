using MediatR;

namespace Fishio.IntegrationEvents.Payments;

public record DummyPaymentEvent(
    Guid PaymentId,
    decimal Amount,
    DateTime OccurredOn) : INotification;