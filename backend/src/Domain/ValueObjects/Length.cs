namespace Fishio.Domain.ValueObjects;

public class Length : ValueObject
{
    public decimal Centimeters { get; private set; }

    private Length(decimal centimeters)
    {
        if (centimeters < 0)
            throw new ArgumentException("Length cannot be negative", nameof(centimeters));

        Centimeters = centimeters;
    }

    public static Length FromCentimeters(decimal centimeters) => new(centimeters);
    public static Length FromMeters(decimal meters) => new(meters * 100);
    public static Length FromMillimeters(decimal millimeters) => new(millimeters / 10);
    public static Length Zero => new(0);

    public decimal ToMeters() => Centimeters / 100;
    public decimal ToMillimeters() => Centimeters * 10;

    public static Length operator +(Length left, Length right) => new(left.Centimeters + right.Centimeters);
    public static Length operator -(Length left, Length right) => new(left.Centimeters - right.Centimeters);
    public static Length operator *(Length length, decimal multiplier) => new(length.Centimeters * multiplier);
    public static Length operator /(Length length, decimal divisor) => new(length.Centimeters / divisor);

    public static bool operator >(Length left, Length right) => left.Centimeters > right.Centimeters;
    public static bool operator <(Length left, Length right) => left.Centimeters < right.Centimeters;
    public static bool operator >=(Length left, Length right) => left.Centimeters >= right.Centimeters;
    public static bool operator <=(Length left, Length right) => left.Centimeters <= right.Centimeters;

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Centimeters;
    }

    public override string ToString()
    {
        if (Centimeters >= 100)
            return $"{ToMeters():F2} m";
        else
            return $"{Centimeters:F1} cm";
    }
}
