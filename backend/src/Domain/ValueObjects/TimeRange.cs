namespace Fishio.Domain.ValueObjects;

public class TimeRange : ValueObject
{
    public TimeOnly StartTime { get; private set; }
    public TimeOnly EndTime { get; private set; }

    public TimeRange(TimeOnly startTime, TimeOnly endTime)
    {
        if (startTime >= endTime)
            throw new ArgumentException("Start time must be before end time");

        StartTime = startTime;
        EndTime = endTime;
    }

    public TimeSpan Duration => EndTime.ToTimeSpan() - StartTime.ToTimeSpan();

    public bool Contains(TimeOnly time) => time >= StartTime && time <= EndTime;

    public bool Contains(DateTime dateTime) => Contains(TimeOnly.FromDateTime(dateTime));

    public bool Overlaps(TimeRange other)
    {
        return StartTime < other.EndTime && EndTime > other.StartTime;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return StartTime;
        yield return EndTime;
    }

    public override string ToString() => $"{StartTime:HH:mm} - {EndTime:HH:mm}";
}
