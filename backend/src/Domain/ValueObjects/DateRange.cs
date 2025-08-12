namespace Fishio.Domain.ValueObjects;

public class DateRange : ValueObject
{
    public DateOnly StartDate { get; private set; }
    public DateOnly EndDate { get; private set; }

    public DateRange(DateOnly startDate, DateOnly endDate)
    {
        if (startDate > endDate)
            throw new ArgumentException("Start date must be before or equal to end date");

        StartDate = startDate;
        EndDate = endDate;
    }

    public int Days => EndDate.DayNumber - StartDate.DayNumber + 1;

    public bool Contains(DateOnly date) => date >= StartDate && date <= EndDate;

    public bool Contains(DateTime dateTime) => Contains(DateOnly.FromDateTime(dateTime));

    public bool Overlaps(DateRange other)
    {
        return StartDate <= other.EndDate && EndDate >= other.StartDate;
    }

    public IEnumerable<DateOnly> GetDates()
    {
        var current = StartDate;
        while (current <= EndDate)
        {
            yield return current;
            current = current.AddDays(1);
        }
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return StartDate;
        yield return EndDate;
    }

    public override string ToString()
    {
        if (StartDate == EndDate)
            return StartDate.ToString("yyyy-MM-dd");
        else
            return $"{StartDate:yyyy-MM-dd} - {EndDate:yyyy-MM-dd}";
    }
}
