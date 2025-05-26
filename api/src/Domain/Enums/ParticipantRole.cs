using System.ComponentModel;

namespace Fishio.Domain.Enums;

public enum ParticipantRole
{
    [Description("Organizator")]
    Organizer,

    [Description("Sędzia")]
    Judge,

    [Description("Zawodnik")]
    Competitor
}
