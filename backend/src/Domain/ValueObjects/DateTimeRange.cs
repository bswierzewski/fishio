namespace Fishio.Domain.ValueObjects;

public class DateTimeRange : ValueObject
{
    public DateTime Start { get; private set; }
    public DateTime End { get; private set; }

    public DateTimeRange(DateTime start, DateTime end)
    {
        if (start >= end)
            throw new ArgumentException("Start datetime must be before end datetime");

        Start = start;
        End = end;
    }

    public TimeSpan Duration => End - Start;

    public bool Contains(DateTime dateTime) => dateTime >= Start && dateTime <= End;

    public bool Overlaps(DateTimeRange other)
    {
        return Start < other.End && End > other.Start;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Start;
        yield return End;
    }

    public override string ToString()
    {
        return $"{Start:yyyy-MM-dd HH:mm} - {End:yyyy-MM-dd HH:mm}";
    }
}
