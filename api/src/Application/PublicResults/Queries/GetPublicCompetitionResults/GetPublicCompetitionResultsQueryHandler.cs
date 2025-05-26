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
        var competition = await _context.Competitions
            .AsNoTracking()
            .Include(c => c.Fishery)
            .Include(c => c.Categories)
                .ThenInclude(cc => cc.CategoryDefinition)
            .Include(c => c.Categories)
                .ThenInclude(cc => cc.FishSpecies)
            .Include(c => c.Participants)
                .ThenInclude(p => p.User)
            .Include(c => c.FishCatches)
                .ThenInclude(fc => fc.FishSpecies)
            .Include(c => c.FishCatches) // Ponowne dołączenie, aby EF Core załadował wszystkie powiązane dane dla FishCatches
                .ThenInclude(fc => fc.Participant) // Potrzebne do identyfikacji uczestnika przy połowie
            .FirstOrDefaultAsync(c => c.ResultsToken == request.ResultsToken, cancellationToken);

        if (competition == null)
        {
            return null;
        }

        var now = _timeProvider.GetUtcNow();
        var effectiveStatus = DetermineEffectiveStatus(competition, now);

        var primaryScoringCategory = competition.Categories
            .FirstOrDefault(c => c.IsPrimaryScoring && c.IsEnabled);

        var dto = new PublicCompetitionResultsDto
        {
            CompetitionId = competition.Id,
            CompetitionName = competition.Name,
            StartTime = competition.Schedule.Start,
            EndTime = competition.Schedule.End,
            FisheryName = competition.Fishery?.Name,
            CompetitionImageUrl = competition.ImageUrl,
            Status = effectiveStatus,
            Rules = competition.Rules,
            PrimaryScoringCategoryName = primaryScoringCategory?.CustomNameOverride ?? primaryScoringCategory?.CategoryDefinition.Name,
            PrimaryScoringMetric = primaryScoringCategory?.CategoryDefinition.Metric
        };

        switch (effectiveStatus)
        {
            case CompetitionStatus.Upcoming:
            case CompetitionStatus.Scheduled:
            case CompetitionStatus.AcceptingRegistrations:
                dto = dto with { UpcomingMessage = $"Zawody '{competition.Name}' rozpoczną się {competition.Schedule.Start:g}. Zapraszamy!" };
                break;

            case CompetitionStatus.Ongoing:
                dto = dto with { LiveRankingPlaceholderMessage = "Ranking jest aktualizowany na bieżąco." };
                dto = dto with { MainRanking = await CalculateMainRankingAsync(competition, primaryScoringCategory, cancellationToken) };
                break;

            case CompetitionStatus.Finished:
                dto = dto with { MainRanking = await CalculateMainRankingAsync(competition, primaryScoringCategory, cancellationToken) };
                dto = dto with { SpecialCategoriesResults = await CalculateSpecialCategoriesResultsAsync(competition, cancellationToken) };
                dto = dto with { FinishedChartsPlaceholderMessage = "Wykresy i dodatkowe analizy będą dostępne wkrótce." };
                break;

            case CompetitionStatus.Cancelled:
                dto = dto with { UpcomingMessage = $"Zawody '{competition.Name}' zostały anulowane." };
                break;
        }

        return dto;
    }

    private CompetitionStatus DetermineEffectiveStatus(Competition competition, DateTimeOffset now)
    {
        if (competition.Status == CompetitionStatus.Cancelled || competition.Status == CompetitionStatus.Finished)
        {
            return competition.Status;
        }
        if (now < competition.Schedule.Start)
        {
            return competition.Status == CompetitionStatus.AcceptingRegistrations || competition.Status == CompetitionStatus.Scheduled
                   ? competition.Status
                   : CompetitionStatus.Upcoming;
        }
        if (now >= competition.Schedule.Start && now <= competition.Schedule.End)
        {
            return CompetitionStatus.Ongoing;
        }
        if (now > competition.Schedule.End)
        {
            return CompetitionStatus.Finished;
        }
        return competition.Status;
    }

    private async Task<List<PublicResultParticipantDto>> CalculateMainRankingAsync(
        Competition competition,
        CompetitionCategory? primaryScoringCategory,
        CancellationToken cancellationToken)
    {
        var ranking = new List<PublicResultParticipantDto>();
        if (primaryScoringCategory == null) return ranking;

        var metric = primaryScoringCategory.CategoryDefinition.Metric;
        var calcLogic = primaryScoringCategory.CategoryDefinition.CalculationLogic;

        foreach (var participant in competition.Participants.Where(p => p.Role == ParticipantRole.Competitor))
        {
            var participantCatches = competition.FishCatches
                .Where(fc => fc.ParticipantId == participant.Id)
                .ToList();

            decimal totalScore = 0;
            int fishCount = participantCatches.Count;

            if (calcLogic == CategoryCalculationLogic.SumValue)
            {
                switch (metric)
                {
                    case CategoryMetric.WeightKg:
                        totalScore = participantCatches.Sum(fc => fc.Weight?.Value ?? 0);
                        break;
                    case CategoryMetric.LengthCm:
                        totalScore = participantCatches.Sum(fc => fc.Length?.Value ?? 0);
                        break;
                    case CategoryMetric.FishCount:
                        totalScore = fishCount;
                        break;
                }
            }
            else if (calcLogic == CategoryCalculationLogic.MaxValue) // Np. dla "Największa Ryba" jako główna kategoria
            {
                switch (metric)
                {
                    case CategoryMetric.WeightKg:
                        totalScore = participantCatches.Any() ? participantCatches.Max(fc => fc.Weight?.Value ?? 0) : 0;
                        break;
                    case CategoryMetric.LengthCm:
                        totalScore = participantCatches.Any() ? participantCatches.Max(fc => fc.Length?.Value ?? 0) : 0;
                        break;
                    case CategoryMetric.FishCount: // MaxValue dla FishCount nie ma sensu jako główna kategoria sumująca, ale dla kompletności
                        totalScore = fishCount > 0 ? 1 : 0; // Lub po prostu fishCount, jeśli to jedyna kategoria
                        break;
                }
            }
            // TODO: Dodać obsługę MinValue, FirstOccurrence, LastOccurrence, ManualAssignment (choć Manual dla głównej jest rzadkie)

            ranking.Add(new PublicResultParticipantDto
            {
                ParticipantId = participant.Id,
                Name = participant.User?.Name ?? participant.GuestName ?? "Uczestnik",
                TotalScore = totalScore,
                FishCount = fishCount
            });
        }

        // Sortowanie: Domyślnie większy wynik jest lepszy.
        // Jeśli metryka lub logika wskazuje inaczej (np. MinValue), trzeba by odwrócić sortowanie.
        // Na razie zakładamy, że większy TotalScore jest lepszy.
        return ranking
            .OrderByDescending(r => r.TotalScore)
            .ThenByDescending(r => r.FishCount) // Dodatkowe kryterium przy remisie
            .ToList();
    }

    private async Task<List<PublicResultSpecialCategoryDto>> CalculateSpecialCategoriesResultsAsync(
        Competition competition,
        CancellationToken cancellationToken)
    {
        var specialCategoriesResults = new List<PublicResultSpecialCategoryDto>();
        var specialCategories = competition.Categories
            .Where(c => !c.IsPrimaryScoring && c.IsEnabled) // Bierzemy wszystkie nie-główne, aktywne
            .OrderBy(c => c.SortOrder)
            .ToList();

        foreach (var categoryConfig in specialCategories)
        {
            var definition = categoryConfig.CategoryDefinition;
            var categoryResult = new PublicResultSpecialCategoryDto
            {
                CategoryName = categoryConfig.CustomNameOverride ?? definition.Name,
                CategoryDescription = categoryConfig.CustomDescriptionOverride ?? definition.Description,
                Winners = new List<PublicResultCategoryWinnerDto>()
            };

            // Logika dla kategorii opartych na pojedynczym połowie (FishCatch)
            if (definition.EntityType == CategoryEntityType.FishCatch)
            {
                IEnumerable<CompetitionFishCatch> relevantCatches = competition.FishCatches;
                if (definition.RequiresSpecificFishSpecies && categoryConfig.FishSpeciesId.HasValue)
                {
                    relevantCatches = relevantCatches.Where(fc => fc.FishSpeciesId == categoryConfig.FishSpeciesId.Value);
                }

                CompetitionFishCatch? winningCatch = null;
                decimal winningValue = 0;

                switch (definition.CalculationLogic)
                {
                    case CategoryCalculationLogic.MaxValue:
                        if (definition.Metric == CategoryMetric.WeightKg)
                        {
                            winningCatch = relevantCatches.Where(fc => fc.Weight != null)
                                .OrderByDescending(fc => fc.Weight!.Value).FirstOrDefault();
                            winningValue = winningCatch?.Weight?.Value ?? 0;
                        }
                        else if (definition.Metric == CategoryMetric.LengthCm)
                        {
                            winningCatch = relevantCatches.Where(fc => fc.Length != null)
                                .OrderByDescending(fc => fc.Length!.Value).FirstOrDefault();
                            winningValue = winningCatch?.Length?.Value ?? 0;
                        }
                        // Inne metryki dla MaxValue...
                        break;

                    case CategoryCalculationLogic.MinValue: // Np. Najmniejsza ryba (jeśli taka kategoria)
                        if (definition.Metric == CategoryMetric.WeightKg)
                        {
                            winningCatch = relevantCatches.Where(fc => fc.Weight != null)
                                .OrderBy(fc => fc.Weight!.Value).FirstOrDefault();
                            winningValue = winningCatch?.Weight?.Value ?? 0;
                        }
                        else if (definition.Metric == CategoryMetric.LengthCm)
                        {
                            winningCatch = relevantCatches.Where(fc => fc.Length != null)
                                .OrderBy(fc => fc.Length!.Value).FirstOrDefault();
                            winningValue = winningCatch?.Length?.Value ?? 0;
                        }
                        break;

                    case CategoryCalculationLogic.FirstOccurrence: // Np. Pierwsza złowiona ryba danego gatunku
                        if (definition.Metric == CategoryMetric.TimeOfCatch) // Lub dowolna inna metryka, jeśli czas jest decydujący
                        {
                            winningCatch = relevantCatches.OrderBy(fc => fc.CatchTime).FirstOrDefault();
                            // winningValue tutaj może nie być istotne, lub to czas
                        }
                        break;
                        // TODO: Dodać LastOccurrence
                }

                if (winningCatch != null)
                {
                    var winnerParticipant = competition.Participants.First(p => p.Id == winningCatch.ParticipantId);
                    categoryResult.Winners.Add(new PublicResultCategoryWinnerDto
                    {
                        ParticipantId = winnerParticipant.Id,
                        ParticipantName = winnerParticipant.User?.Name ?? winnerParticipant.GuestName ?? "Uczestnik",
                        FishSpeciesName = winningCatch.FishSpecies?.Name,
                        Value = GetMetricValue(winningCatch, definition.Metric),
                        Unit = GetMetricUnit(definition.Metric)
                    });
                }
            }
            // Logika dla kategorii opartych na agregacji połowów uczestnika (ParticipantAggregateCatches)
            else if (definition.EntityType == CategoryEntityType.ParticipantAggregateCatches)
            {
                var participantScores = new List<(CompetitionParticipant participant, decimal score, int fishCount)>();

                foreach (var participant in competition.Participants.Where(p => p.Role == ParticipantRole.Competitor))
                {
                    var participantCatches = competition.FishCatches.Where(fc => fc.ParticipantId == participant.Id);
                    if (definition.RequiresSpecificFishSpecies && categoryConfig.FishSpeciesId.HasValue)
                    {
                        participantCatches = participantCatches.Where(fc => fc.FishSpeciesId == categoryConfig.FishSpeciesId.Value);
                    }

                    decimal currentScore = 0;
                    if (definition.CalculationLogic == CategoryCalculationLogic.SumValue)
                    {
                        if (definition.Metric == CategoryMetric.FishCount) currentScore = participantCatches.Count();
                        else if (definition.Metric == CategoryMetric.WeightKg) currentScore = participantCatches.Sum(fc => fc.Weight?.Value ?? 0);
                        else if (definition.Metric == CategoryMetric.LengthCm) currentScore = participantCatches.Sum(fc => fc.Length?.Value ?? 0);
                        // TODO: SpeciesVariety
                    }
                    // Inne logiki obliczeniowe dla agregacji...
                    participantScores.Add((participant, currentScore, participantCatches.Count()));
                }

                // Wybierz zwycięzcę(ów) na podstawie CalculationLogic (np. MaxValue dla sumy)
                if (definition.CalculationLogic == CategoryCalculationLogic.SumValue || definition.CalculationLogic == CategoryCalculationLogic.MaxValue) // MaxValue dla zagregowanej sumy
                {
                    var winners = participantScores.OrderByDescending(ps => ps.score)
                                                   .ThenByDescending(ps => ps.fishCount) // Dodatkowe kryterium
                                                   .Take(categoryConfig.MaxWinnersToDisplay);
                    foreach (var winner in winners)
                    {
                        if (winner.score > 0 || definition.Metric == CategoryMetric.FishCount) // Pokaż zwycięzcę, jeśli ma wynik lub liczymy sztuki
                        {
                            categoryResult.Winners.Add(new PublicResultCategoryWinnerDto
                            {
                                ParticipantId = winner.participant.Id,
                                ParticipantName = winner.participant.User?.Name ?? winner.participant.GuestName ?? "Uczestnik",
                                Value = winner.score,
                                Unit = GetMetricUnit(definition.Metric),
                                FishSpeciesName = (definition.RequiresSpecificFishSpecies && categoryConfig.FishSpeciesId.HasValue)
                                   ? categoryConfig.FishSpecies?.Name // Nazwa gatunku z konfiguracji kategorii
                                   : null
                            });
                        }
                    }
                }
                // TODO: Inne logiki dla agregacji
            }
            // TODO: Logika dla CategoryEntityType.ParticipantProfile (np. najmłodszy/najstarszy uczestnik)
            // TODO: Logika dla CategoryCalculationLogic.ManualAssignment (pobranie ręcznie przypisanych zwycięzców)

            if (categoryResult.Winners.Any() || definition.AllowManualWinnerAssignment)
            {
                specialCategoriesResults.Add(categoryResult);
            }
        }
        return specialCategoriesResults;
    }

    private decimal? GetMetricValue(CompetitionFishCatch fishCatch, CategoryMetric metric)
    {
        return metric switch
        {
            CategoryMetric.WeightKg => fishCatch.Weight?.Value,
            CategoryMetric.LengthCm => fishCatch.Length?.Value,
            CategoryMetric.FishCount => 1, // Dla pojedynczego połowu to zawsze 1
            CategoryMetric.TimeOfCatch => fishCatch.CatchTime.ToUnixTimeSeconds(), // Przykład
            _ => null
        };
    }

    private string? GetMetricUnit(CategoryMetric metric)
    {
        return metric switch
        {
            CategoryMetric.WeightKg => "kg",
            CategoryMetric.LengthCm => "cm",
            CategoryMetric.FishCount => "szt.",
            _ => null
        };
    }
}
