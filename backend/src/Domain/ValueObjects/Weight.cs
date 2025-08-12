namespace Fishio.Domain.ValueObjects;

public class Weight : ValueObject
{
    public decimal Grams { get; private set; }

    private Weight(decimal grams)
    {
        if (grams < 0)
            throw new ArgumentException("Weight cannot be negative", nameof(grams));

        Grams = grams;
    }

    public static Weight FromGrams(decimal grams) => new(grams);
    public static Weight FromKilograms(decimal kilograms) => new(kilograms * 1000);
    public static Weight Zero => new(0);

    public decimal ToKilograms() => Grams / 1000;

    public static Weight operator +(Weight left, Weight right) => new(left.Grams + right.Grams);
    public static Weight operator -(Weight left, Weight right) => new(left.Grams - right.Grams);
    public static Weight operator *(Weight weight, decimal multiplier) => new(weight.Grams * multiplier);
    public static Weight operator /(Weight weight, decimal divisor) => new(weight.Grams / divisor);

    public static bool operator >(Weight left, Weight right) => left.Grams > right.Grams;
    public static bool operator <(Weight left, Weight right) => left.Grams < right.Grams;
    public static bool operator >=(Weight left, Weight right) => left.Grams >= right.Grams;
    public static bool operator <=(Weight left, Weight right) => left.Grams <= right.Grams;

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Grams;
    }

    public override string ToString()
    {
        if (Grams >= 1000)
            return $"{ToKilograms():F2} kg";
        else
            return $"{Grams:F0} g";
    }
}
