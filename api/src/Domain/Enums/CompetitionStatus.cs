﻿using System.ComponentModel;

namespace Fishio.Domain.Enums;

public enum CompetitionStatus
{
    [Description("Szkic")]
    Draft,

    [Description("Przyjmuje rejestracje")]
    AcceptingRegistrations,

    [Description("Zaplanowane")]
    Scheduled,

    [Description("W trakcie")]
    Ongoing,

    [Description("Zakończone")]
    Finished,

    [Description("Anulowane")]
    Cancelled
}
