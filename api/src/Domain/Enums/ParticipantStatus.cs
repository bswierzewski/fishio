using System.ComponentModel;

namespace Fishio.Domain.Enums;

public enum ParticipantStatus
{
    [Description("Oczekuje")]
    Waiting,

    [Description("Zatwierdzony")]
    Approved,

    [Description("Odrzucony")]
    Rejected
}