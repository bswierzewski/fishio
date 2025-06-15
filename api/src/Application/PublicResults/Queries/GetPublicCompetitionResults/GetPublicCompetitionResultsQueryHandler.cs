using Fishio.Application.PublicResults.Queries.GetPublicCompetitionResults;

namespace Fishio.Application.Competitions.Queries.GetPublicCompetitionResults;

public class GetPublicCompetitionResultsQueryHandler : IRequestHandler<GetPublicCompetitionResultsQuery, PublicCompetitionResultsDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly TimeProvider _timeProvider;

    public GetPublicCompetitionResultsQueryHandler(IApplicationDbContext context, TimeProvider timeProvider)
    {
        _context = context;
        _timeProvider = timeProvider;
    }

    public async Task<PublicCompetitionResultsDto?> Handle(GetPublicCompetitionResultsQuery request, CancellationToken cancellationToken)
    {
        // Znajdź zawody po tokenie
        var competition = await _context.Competitions
            .Include(c => c.Fishery)
            .Include(c => c.Categories.Where(cat => cat.IsEnabled))
                .ThenInclude(cat => cat.CategoryDefinition)
            .Include(c => c.Categories.Where(cat => cat.IsEnabled))
                .ThenInclude(cat => cat.FishSpecies)
            .Include(c => c.Participants.Where(p => p.Status == ParticipantStatus.Approved && p.Role == ParticipantRole.Competitor))
                .ThenInclude(p => p.User)
            .Include(c => c.FishCatches)
                .ThenInclude(fc => fc.Participant)
                    .ThenInclude(p => p.User)
            .Include(c => c.FishCatches)
                .ThenInclude(fc => fc.FishSpecies)
            .Include(c => c.FishCatches)
                .ThenInclude(fc => fc.Judge)
            .FirstOrDefaultAsync(c => c.ResultsToken == request.ResultsToken, cancellationToken);

        if (competition == null)
        {
            return null;
        }

        // Pobierz tylko zatwierdzonych uczestników-zawodników
        var approvedParticipants = competition.Participants
            .Where(p => p.Status == ParticipantStatus.Approved && p.Role == ParticipantRole.Competitor)
            .ToList();

        // Pobierz wszystkie połowy dla zawodów
        var allCatches = competition.FishCatches.ToList();

        var usesSectors = competition.UsesSectors();

        List<CategoryResultDto> globalCategoryResults = [];
        List<SectorResultDto> sectorResults = [];

        if (usesSectors)
        {
            // Zawody z sektorami - oblicz wyniki per sektor
            sectorResults = await CalculateSectorResults(competition, approvedParticipants, allCatches);

            // Opcjonalnie: oblicz także globalne wyniki dla porównania
            // globalCategoryResults = await CalculateGlobalResults(competition, approvedParticipants, allCatches);
        }
        else
        {
            // Zawody bez sektorów - oblicz globalne wyniki
            globalCategoryResults = await CalculateGlobalResults(competition, approvedParticipants, allCatches);
        }

        return new PublicCompetitionResultsDto
        {
            CompetitionId = competition.Id,
            CompetitionName = competition.Name,
            StartTime = competition.Schedule.Start,
            EndTime = competition.Schedule.End,
            Status = competition.Status,
            FisheryName = competition.Fishery?.Name,
            FisheryLocation = competition.Fishery?.Location,
            CompetitionImageUrl = competition.ImageUrl,
            TotalParticipants = approvedParticipants.Count,
            TotalCatches = allCatches.Count,
            LastUpdated = _timeProvider.GetUtcNow(),
            UsesSectors = usesSectors,
            CategoryResults = globalCategoryResults,
            SectorResults = sectorResults
        };
    }

    private async Task<List<CategoryResultDto>> CalculateGlobalResults(
        Competition competition,
        List<CompetitionParticipant> participants,
        List<CompetitionFishCatch> allCatches)
    {
        // Oblicz wyniki dla każdej kategorii równolegle
        var categoryTasks = competition.Categories
            .Where(c => c.IsEnabled)
            .OrderBy(c => c.SortOrder)
            .Select(category => CalculateCategoryResults(category, participants, allCatches))
            .ToArray();

        var categoryResults = await Task.WhenAll(categoryTasks);
        return categoryResults.ToList();
    }

    private async Task<List<SectorResultDto>> CalculateSectorResults(
        Competition competition,
        List<CompetitionParticipant> participants,
        List<CompetitionFishCatch> allCatches)
    {
        var sectorResults = new List<SectorResultDto>();

        foreach (var sectorName in competition.GetUsedSectors())
        {
            // Pobierz uczestników przypisanych do tego sektora
            var sectorParticipants = competition.GetParticipantsInSector(sectorName).ToList();

            if (!sectorParticipants.Any())
                continue; // Pomiń sektory bez uczestników

            // Pobierz połowy tylko dla uczestników z tego sektora
            var sectorParticipantIds = sectorParticipants.Select(p => p.Id).ToHashSet();
            var sectorCatches = allCatches.Where(c => sectorParticipantIds.Contains(c.ParticipantId)).ToList();

            // Oblicz wyniki dla każdej kategorii w tym sektorze
            var categoryTasks = competition.Categories
                .Where(c => c.IsEnabled)
                .OrderBy(c => c.SortOrder)
                .Select(category => CalculateCategoryResults(category, sectorParticipants, sectorCatches))
                .ToArray();

            var sectorCategoryResults = await Task.WhenAll(categoryTasks);

            // Stwórz informacje o uczestnikach sektora
            var sectorParticipantDtos = sectorParticipants
                .OrderBy(p => p.Stand ?? "")
                .ThenBy(p => p.User?.Name ?? p.GuestName)
                .Select(p => new SectorParticipantDto
                {
                    ParticipantId = p.Id,
                    ParticipantName = p.User?.Name ?? p.GuestName ?? "Nieznany uczestnik",
                    Stand = p.Stand
                })
                .ToList();

            sectorResults.Add(new SectorResultDto
            {
                SectorName = sectorName,
                ParticipantsCount = sectorParticipants.Count,
                CatchesCount = sectorCatches.Count,
                CategoryResults = sectorCategoryResults.ToList(),
                Participants = sectorParticipantDtos
            });
        }

        return sectorResults.OrderBy(s => s.SectorName).ToList();
    }

    private Task<CategoryResultDto> CalculateCategoryResults(
        CompetitionCategory category,
        List<CompetitionParticipant> participants,
        List<CompetitionFishCatch> allCatches)
    {
        var categoryResult = new CategoryResultDto
        {
            CategoryId = category.Id,
            CategoryName = category.CustomNameOverride ?? category.CategoryDefinition.Name,
            CategoryDescription = category.CustomDescriptionOverride ?? category.CategoryDefinition.Description,
            IsPrimaryScoring = category.IsPrimaryScoring,
            CategoryType = category.CategoryDefinition.Type,
            Metric = category.CategoryDefinition.Metric,
            CalculationLogic = category.CategoryDefinition.CalculationLogic,
            EntityType = category.CategoryDefinition.EntityType,
            FishSpeciesName = category.FishSpecies?.Name,
            MaxWinnersToDisplay = category.MaxWinnersToDisplay,
            MetricUnit = GetMetricUnit(category.CategoryDefinition.Metric),
            Rankings = CalculateRankings(category, participants, allCatches)
        };

        return Task.FromResult(categoryResult);
    }

    private List<ParticipantResultDto> CalculateRankings(
        CompetitionCategory category,
        List<CompetitionParticipant> participants,
        List<CompetitionFishCatch> allCatches)
    {
        var participantResults = new List<ParticipantResultDto>();

        foreach (var participant in participants)
        {
            // Filtruj połowy dla danego uczestnika i kategorii
            var participantCatches = FilterCatchesForCategory(category, participant, allCatches);

            if (!participantCatches.Any() && category.CategoryDefinition.EntityType != CategoryEntityType.ParticipantProfile)
            {
                // Jeśli uczestnik nie ma połowów w tej kategorii, dodaj go z wartością 0
                participantResults.Add(new ParticipantResultDto
                {
                    ParticipantId = participant.Id,
                    ParticipantName = participant.User?.Name ?? participant.GuestName ?? "Nieznany uczestnik",
                    Position = 0, // Zostanie ustawione później
                    Value = 0,
                    ValueDisplay = "0",
                    CatchesCount = 0,
                    BestCatch = null,
                    AllCatches = []
                });
                continue;
            }

            var result = CalculateParticipantValue(category, participant, participantCatches);
            participantResults.Add(result);
        }

        // Sortuj i przypisz pozycje
        var sortedResults = SortParticipantResults(participantResults, category.CategoryDefinition);
        AssignPositions(sortedResults);

        // Ogranicz do maksymalnej liczby zwycięzców do wyświetlenia
        return sortedResults.Take(Math.Max(category.MaxWinnersToDisplay, participants.Count)).ToList();
    }

    private List<CompetitionFishCatch> FilterCatchesForCategory(
        CompetitionCategory category,
        CompetitionParticipant participant,
        List<CompetitionFishCatch> allCatches)
    {
        var catches = allCatches.Where(c => c.ParticipantId == participant.Id).ToList();

        // Jeśli kategoria wymaga konkretnego gatunku ryby
        if (category.FishSpeciesId.HasValue)
        {
            catches = catches.Where(c => c.FishSpeciesId == category.FishSpeciesId.Value).ToList();
        }

        // Dodatkowe filtrowanie na podstawie metryki
        return category.CategoryDefinition.Metric switch
        {
            CategoryMetric.LengthCm => catches.Where(c => c.Length?.Value > 0).ToList(),
            CategoryMetric.WeightKg => catches.Where(c => c.Weight?.Value > 0).ToList(),
            CategoryMetric.FishCount => catches, // Wszystkie połowy liczą się do liczby ryb
            CategoryMetric.SpeciesVariety => catches, // Wszystkie połowy liczą się do różnorodności
            CategoryMetric.TimeOfCatch => catches, // Wszystkie połowy mają czas
            _ => catches
        };
    }

    private ParticipantResultDto CalculateParticipantValue(
        CompetitionCategory category,
        CompetitionParticipant participant,
        List<CompetitionFishCatch> participantCatches)
    {
        var participantName = participant.User?.Name ?? participant.GuestName ?? "Nieznany uczestnik";
        var catchSummaries = participantCatches.Select(c => new CatchSummaryDto
        {
            CatchId = c.Id,
            FishSpeciesName = c.FishSpecies?.Name,
            LengthInCm = c.Length?.Value,
            WeightInKg = c.Weight?.Value,
            CatchTime = c.CatchTime
        }).ToList();

        // Oblicz wartość na podstawie typu kalkulacji i metryki
        var (value, bestCatch) = category.CategoryDefinition.EntityType switch
        {
            CategoryEntityType.FishCatch => CalculateFishCatchValue(category, participantCatches),
            CategoryEntityType.ParticipantAggregateCatches => CalculateAggregateValue(category, participantCatches),
            CategoryEntityType.ParticipantProfile => CalculateProfileValue(category, participant),
            _ => (0m, null)
        };

        return new ParticipantResultDto
        {
            ParticipantId = participant.Id,
            ParticipantName = participantName,
            Position = 0, // Zostanie ustawione później
            Value = value,
            ValueDisplay = FormatValueDisplay(value, category.CategoryDefinition.Metric),
            CatchesCount = participantCatches.Count,
            BestCatch = bestCatch,
            AllCatches = catchSummaries
        };
    }

    private (decimal value, BestCatchDetailsDto? bestCatch) CalculateFishCatchValue(
        CompetitionCategory category,
        List<CompetitionFishCatch> catches)
    {
        if (!catches.Any()) return (0, null);

        var bestCatchEntity = category.CategoryDefinition.CalculationLogic switch
        {
            CategoryCalculationLogic.MaxValue => GetMaxValueCatch(catches, category.CategoryDefinition.Metric),
            CategoryCalculationLogic.MinValue => GetMinValueCatch(catches, category.CategoryDefinition.Metric),
            CategoryCalculationLogic.FirstOccurrence => catches.OrderBy(c => c.CatchTime).First(),
            CategoryCalculationLogic.LastOccurrence => catches.OrderByDescending(c => c.CatchTime).First(),
            _ => catches.First()
        };

        if (bestCatchEntity == null) return (0, null);

        var value = ExtractValueFromCatch(bestCatchEntity, category.CategoryDefinition.Metric);
        var bestCatch = new BestCatchDetailsDto
        {
            CatchId = bestCatchEntity.Id,
            FishSpeciesName = bestCatchEntity.FishSpecies?.Name,
            LengthInCm = bestCatchEntity.Length?.Value,
            WeightInKg = bestCatchEntity.Weight?.Value,
            CatchTime = bestCatchEntity.CatchTime,
            JudgeName = bestCatchEntity.Judge?.Name ?? "Nieznany sędzia"
        };

        return (value, bestCatch);
    }

    private (decimal value, BestCatchDetailsDto? bestCatch) CalculateAggregateValue(
        CompetitionCategory category,
        List<CompetitionFishCatch> catches)
    {
        if (!catches.Any()) return (0, null);

        var value = category.CategoryDefinition.Metric switch
        {
            CategoryMetric.LengthCm => catches.Sum(c => c.Length?.Value ?? 0),
            CategoryMetric.WeightKg => catches.Sum(c => c.Weight?.Value ?? 0),
            CategoryMetric.FishCount => catches.Count,
            CategoryMetric.SpeciesVariety => catches.Where(c => c.FishSpeciesId.HasValue)
                                                   .Select(c => c.FishSpeciesId!.Value)
                                                   .Distinct()
                                                   .Count(),
            _ => 0
        };

        // Dla kategorii agregujących, najlepszy połów to ten z najwyższą wartością w danej metryce
        var bestCatchEntity = GetMaxValueCatch(catches, category.CategoryDefinition.Metric);
        var bestCatch = bestCatchEntity != null ? new BestCatchDetailsDto
        {
            CatchId = bestCatchEntity.Id,
            FishSpeciesName = bestCatchEntity.FishSpecies?.Name,
            LengthInCm = bestCatchEntity.Length?.Value,
            WeightInKg = bestCatchEntity.Weight?.Value,
            CatchTime = bestCatchEntity.CatchTime,
            JudgeName = bestCatchEntity.Judge?.Name ?? "Nieznany sędzia"
        } : null;

        return (value, bestCatch);
    }

    private (decimal value, BestCatchDetailsDto? bestCatch) CalculateProfileValue(
        CompetitionCategory category,
        CompetitionParticipant participant)
    {
        // Kategorie profilowe mogą być rozszerzone w przyszłości
        // Na razie zwracamy 0, ponieważ nie mamy zdefiniowanych metryk profilowych
        return (0, null);
    }

    private static CompetitionFishCatch? GetMaxValueCatch(List<CompetitionFishCatch> catches, CategoryMetric metric)
    {
        return metric switch
        {
            CategoryMetric.LengthCm => catches.Where(c => c.Length?.Value > 0).OrderByDescending(c => c.Length!.Value).FirstOrDefault(),
            CategoryMetric.WeightKg => catches.Where(c => c.Weight?.Value > 0).OrderByDescending(c => c.Weight!.Value).FirstOrDefault(),
            CategoryMetric.TimeOfCatch => catches.OrderByDescending(c => c.CatchTime).FirstOrDefault(),
            _ => catches.FirstOrDefault()
        };
    }

    private static CompetitionFishCatch? GetMinValueCatch(List<CompetitionFishCatch> catches, CategoryMetric metric)
    {
        return metric switch
        {
            CategoryMetric.LengthCm => catches.Where(c => c.Length?.Value > 0).OrderBy(c => c.Length!.Value).FirstOrDefault(),
            CategoryMetric.WeightKg => catches.Where(c => c.Weight?.Value > 0).OrderBy(c => c.Weight!.Value).FirstOrDefault(),
            CategoryMetric.TimeOfCatch => catches.OrderBy(c => c.CatchTime).FirstOrDefault(),
            _ => catches.FirstOrDefault()
        };
    }

    private static decimal ExtractValueFromCatch(CompetitionFishCatch fishCatch, CategoryMetric metric)
    {
        return metric switch
        {
            CategoryMetric.LengthCm => fishCatch.Length?.Value ?? 0,
            CategoryMetric.WeightKg => fishCatch.Weight?.Value ?? 0,
            CategoryMetric.FishCount => 1, // Każdy połów liczy się jako 1 ryba
            CategoryMetric.TimeOfCatch => fishCatch.CatchTime.ToUnixTimeSeconds(), // Czas jako liczba sekund
            _ => 0
        };
    }

    private static List<ParticipantResultDto> SortParticipantResults(
        List<ParticipantResultDto> results,
        CategoryDefinition categoryDefinition)
    {
        return categoryDefinition.CalculationLogic switch
        {
            CategoryCalculationLogic.MaxValue or CategoryCalculationLogic.SumValue =>
                results.OrderByDescending(r => r.Value).ThenBy(r => r.ParticipantName).ToList(),
            CategoryCalculationLogic.MinValue =>
                results.OrderBy(r => r.Value).ThenBy(r => r.ParticipantName).ToList(),
            CategoryCalculationLogic.FirstOccurrence =>
                results.OrderBy(r => r.BestCatch?.CatchTime ?? DateTimeOffset.MaxValue).ThenBy(r => r.ParticipantName).ToList(),
            CategoryCalculationLogic.LastOccurrence =>
                results.OrderByDescending(r => r.BestCatch?.CatchTime ?? DateTimeOffset.MinValue).ThenBy(r => r.ParticipantName).ToList(),
            _ => results.OrderByDescending(r => r.Value).ThenBy(r => r.ParticipantName).ToList()
        };
    }

    private static void AssignPositions(List<ParticipantResultDto> sortedResults)
    {
        for (int i = 0; i < sortedResults.Count; i++)
        {
            var currentResult = sortedResults[i];

            // Sprawdź, czy poprzedni wynik ma taką samą wartość (remis)
            if (i > 0 && sortedResults[i - 1].Value == currentResult.Value)
            {
                // Remis - przypisz tę samą pozycję co poprzedni
                currentResult.Position = sortedResults[i - 1].Position;
            }
            else
            {
                // Nowa pozycja
                currentResult.Position = i + 1;
            }
        }
    }

    private static string GetMetricUnit(CategoryMetric metric)
    {
        return metric switch
        {
            CategoryMetric.LengthCm => "cm",
            CategoryMetric.WeightKg => "kg",
            CategoryMetric.FishCount => "szt.",
            CategoryMetric.SpeciesVariety => "gatunków",
            CategoryMetric.TimeOfCatch => "",
            _ => ""
        };
    }

    private static string FormatValueDisplay(decimal? value, CategoryMetric metric)
    {
        if (!value.HasValue || value == 0) return "0";

        return metric switch
        {
            CategoryMetric.LengthCm => $"{value:F1} cm",
            CategoryMetric.WeightKg => $"{value:F2} kg",
            CategoryMetric.FishCount => $"{value:F0} szt.",
            CategoryMetric.SpeciesVariety => $"{value:F0} gatunków",
            CategoryMetric.TimeOfCatch => value.HasValue ? DateTimeOffset.FromUnixTimeSeconds((long)value.Value).ToString("HH:mm:ss") : "00:00:00",
            _ => value?.ToString() ?? "0"
        };
    }
}
