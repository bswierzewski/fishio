namespace Fishio.Application.Competitions.Queries.GetOpenCompetitions;

public class GetOpenCompetitionsQuery : IRequest<PaginatedList<CompetitionSummaryDto>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SearchTerm { get; set; }
    // Można dodać filtry np. po dacie, statusie (choć tu filtrujemy po otwartych)
}

// DTO dla kategorii w zawodach (używane w szczegółach)
public record CompetitionCategoryDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty; // Może być CustomNameOverride lub z definicji
    public string? Description { get; init; }
    public bool IsPrimaryScoring { get; init; }
    public CategoryType DefinitionType { get; init; }
    public CategoryMetric DefinitionMetric { get; init; }
    public string? FishSpeciesName { get; init; } // Jeśli kategoria dotyczy konkretnej ryby
}

// DTO dla uczestnika zawodów (używane w szczegółach)
public record CompetitionParticipantDto
{
    public int Id { get; init; } // ID CompetitionParticipant
    public int? UserId { get; init; }
    public string Name { get; init; } = string.Empty; // User.Name lub GuestName
    public ParticipantRole Role { get; init; }
    public bool AddedByOrganizer { get; init; }
    public ParticipantStatus Status { get; init; }
}

// DTO dla podsumowania zawodów (używane na listach)
public record CompetitionSummaryDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public DateTimeOffset StartTime { get; init; }
    public DateTimeOffset EndTime { get; init; }
    public CompetitionStatus Status { get; init; }
    public CompetitionType Type { get; init; }
    public string? FisheryName { get; init; }
    public string? ImageUrl { get; init; }
    public int ParticipantsCount { get; init; }
    public string? PrimaryScoringInfo { get; init; } // Np. "Suma Wag (kg)"
}

// DTO dla szczegółów zawodów
public record CompetitionDetailsDto : CompetitionSummaryDto // Dziedziczy podstawowe info
{
    public int FisheryId { get; init; }
    public string? OrganizerName { get; init; }
    public int OrganizerId { get; init; }
    public string? Rules { get; init; }
    public string ResultsToken { get; init; } = string.Empty;
    public string? FisheryLocation { get; init; }
    public List<CompetitionCategoryDto> Categories { get; init; } = new();
    public List<CompetitionParticipantDto> ParticipantsList { get; init; } = new();
    // Można dodać listę sędziów osobno, jeśli potrzebne
}