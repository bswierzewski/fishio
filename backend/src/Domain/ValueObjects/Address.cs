namespace Fishio.Domain.ValueObjects;

public class Address : ValueObject
{
    public string Street { get; private set; }
    public string City { get; private set; }
    public string PostalCode { get; private set; }
    public string Country { get; private set; }
    public decimal? Latitude { get; private set; }
    public decimal? Longitude { get; private set; }

    public Address(string street, string city, string postalCode, string country,
        decimal? latitude = null, decimal? longitude = null)
    {
        if (string.IsNullOrWhiteSpace(city))
            throw new ArgumentException("City cannot be empty", nameof(city));

        if (string.IsNullOrWhiteSpace(country))
            throw new ArgumentException("Country cannot be empty", nameof(country));

        Street = street?.Trim() ?? string.Empty;
        City = city.Trim();
        PostalCode = postalCode?.Trim() ?? string.Empty;
        Country = country.Trim();
        Latitude = latitude;
        Longitude = longitude;
    }

    public bool HasCoordinates => Latitude.HasValue && Longitude.HasValue;

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Street;
        yield return City;
        yield return PostalCode;
        yield return Country;
        yield return Latitude ?? 0;
        yield return Longitude ?? 0;
    }

    public override string ToString()
    {
        var parts = new List<string>();

        if (!string.IsNullOrWhiteSpace(Street))
            parts.Add(Street);

        if (!string.IsNullOrWhiteSpace(PostalCode))
            parts.Add($"{PostalCode} {City}");
        else
            parts.Add(City);

        parts.Add(Country);

        return string.Join(", ", parts);
    }
}
