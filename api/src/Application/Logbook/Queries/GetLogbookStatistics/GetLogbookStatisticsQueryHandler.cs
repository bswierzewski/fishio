using System.Globalization;

namespace Fishio.Application.Logbook.Queries.GetLogbookStatistics;

public class GetLogbookStatisticsQueryHandler : IRequestHandler<GetLogbookStatisticsQuery, LogbookStatisticsDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetLogbookStatisticsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<LogbookStatisticsDto> Handle(GetLogbookStatisticsQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId;
        if (!currentUserId.HasValue)
        {
            throw new UnauthorizedAccessException("Użytkownik nie jest zalogowany");
        }

        // Base query for user's logbook entries
        var baseQuery = _context.LogbookEntries
            .Where(e => e.UserId == currentUserId.Value);

        // Apply year filter if specified
        if (request.Year.HasValue)
        {
            var startOfYear = new DateTimeOffset(request.Year.Value, 1, 1, 0, 0, 0, TimeSpan.Zero);
            var endOfYear = startOfYear.AddYears(1);
            baseQuery = baseQuery.Where(e => e.CatchTime >= startOfYear && e.CatchTime < endOfYear);
        }

        var entries = await baseQuery
            .Include(e => e.FishSpecies)
            .Include(e => e.Fishery)
            .ToListAsync(cancellationToken);

        if (!entries.Any())
        {
            return new LogbookStatisticsDto();
        }

        // Basic statistics
        var totalCatches = entries.Count;
        var uniqueSpecies = entries.Where(e => e.FishSpeciesId.HasValue).Select(e => e.FishSpeciesId).Distinct().Count();
        var uniqueFisheries = entries.Where(e => e.FisheryId.HasValue).Select(e => e.FisheryId).Distinct().Count();

        var entriesWithWeight = entries.Where(e => e.Weight != null).ToList();
        var entriesWithLength = entries.Where(e => e.Length != null).ToList();

        var totalWeight = entriesWithWeight.Sum(e => e.Weight!.Value);
        var averageWeight = entriesWithWeight.Any() ? entriesWithWeight.Average(e => e.Weight!.Value) : (decimal?)null;
        var largestWeight = entriesWithWeight.Any() ? entriesWithWeight.Max(e => e.Weight!.Value) : (decimal?)null;

        var averageLength = entriesWithLength.Any() ? entriesWithLength.Average(e => e.Length!.Value) : (decimal?)null;
        var largestLength = entriesWithLength.Any() ? entriesWithLength.Max(e => e.Length!.Value) : (decimal?)null;

        var firstCatch = entries.Min(e => e.CatchTime);
        var lastCatch = entries.Max(e => e.CatchTime);

        // Top species statistics
        var topSpecies = entries
            .Where(e => e.FishSpeciesId.HasValue && e.FishSpecies != null)
            .GroupBy(e => new { e.FishSpeciesId, e.FishSpecies!.Name })
            .Select(g => new LogbookSpeciesStatisticsDto
            {
                FishSpeciesId = g.Key.FishSpeciesId!.Value,
                SpeciesName = g.Key.Name,
                CatchCount = g.Count(),
                TotalWeightKg = g.Where(e => e.Weight != null).Sum(e => e.Weight!.Value),
                AverageWeightKg = g.Where(e => e.Weight != null).Any()
                    ? g.Where(e => e.Weight != null).Average(e => e.Weight!.Value)
                    : (decimal?)null,
                LargestWeightKg = g.Where(e => e.Weight != null).Any()
                    ? g.Where(e => e.Weight != null).Max(e => e.Weight!.Value)
                    : (decimal?)null,
                AverageLengthCm = g.Where(e => e.Length != null).Any()
                    ? g.Where(e => e.Length != null).Average(e => e.Length!.Value)
                    : (decimal?)null,
                LargestLengthCm = g.Where(e => e.Length != null).Any()
                    ? g.Where(e => e.Length != null).Max(e => e.Length!.Value)
                    : (decimal?)null
            })
            .OrderByDescending(s => s.CatchCount)
            .Take(10)
            .ToList();

        // Top fisheries statistics
        var topFisheries = entries
            .Where(e => e.FisheryId.HasValue && e.Fishery != null)
            .GroupBy(e => new { e.FisheryId, e.Fishery!.Name })
            .Select(g => new LogbookFisheryStatisticsDto
            {
                FisheryId = g.Key.FisheryId!.Value,
                FisheryName = g.Key.Name,
                CatchCount = g.Count(),
                UniqueSpecies = g.Where(e => e.FishSpeciesId.HasValue).Select(e => e.FishSpeciesId).Distinct().Count(),
                TotalWeightKg = g.Where(e => e.Weight != null).Sum(e => e.Weight!.Value)
            })
            .OrderByDescending(f => f.CatchCount)
            .Take(10)
            .ToList();

        // Monthly breakdown
        var monthlyStats = entries
            .GroupBy(e => new { e.CatchTime.Year, e.CatchTime.Month })
            .Select(g => new LogbookMonthlyStatisticsDto
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                MonthName = CultureInfo.GetCultureInfo("pl-PL").DateTimeFormat.GetMonthName(g.Key.Month),
                CatchCount = g.Count(),
                TotalWeightKg = g.Where(e => e.Weight != null).Sum(e => e.Weight!.Value),
                UniqueSpecies = g.Where(e => e.FishSpeciesId.HasValue).Select(e => e.FishSpeciesId).Distinct().Count()
            })
            .OrderBy(m => m.Year)
            .ThenBy(m => m.Month)
            .ToList();

        // Size ranges (only for entries with length data)
        var sizeRanges = new List<LogbookSizeRangeStatisticsDto>();
        if (entriesWithLength.Any())
        {
            var ranges = new[]
            {
                new { Name = "Małe (0-20 cm)", Min = 0m, Max = 20m },
                new { Name = "Średnie (20-40 cm)", Min = 20m, Max = 40m },
                new { Name = "Duże (40-60 cm)", Min = 40m, Max = 60m },
                new { Name = "Bardzo duże (60-80 cm)", Min = 60m, Max = 80m },
                new { Name = "Gigantyczne (80+ cm)", Min = 80m, Max = decimal.MaxValue }
            };

            var totalWithLength = entriesWithLength.Count;

            sizeRanges = ranges.Select(range =>
            {
                var count = entriesWithLength.Count(e =>
                    e.Length!.Value >= range.Min &&
                    (range.Max == decimal.MaxValue || e.Length!.Value < range.Max));

                return new LogbookSizeRangeStatisticsDto
                {
                    RangeName = range.Name,
                    MinLengthCm = range.Min,
                    MaxLengthCm = range.Max == decimal.MaxValue ? 0 : range.Max,
                    CatchCount = count,
                    Percentage = totalWithLength > 0 ? Math.Round((decimal)count / totalWithLength * 100, 1) : 0
                };
            }).ToList();
        }

        return new LogbookStatisticsDto
        {
            TotalCatches = totalCatches,
            UniqueSpecies = uniqueSpecies,
            UniqueFisheries = uniqueFisheries,
            TotalWeightKg = totalWeight,
            AverageWeightKg = averageWeight,
            LargestFishWeightKg = largestWeight,
            AverageLengthCm = averageLength,
            LargestFishLengthCm = largestLength,
            FirstCatchDate = firstCatch,
            LastCatchDate = lastCatch,
            TopSpecies = topSpecies,
            TopFisheries = topFisheries,
            MonthlyBreakdown = monthlyStats,
            SizeRanges = sizeRanges
        };
    }
}