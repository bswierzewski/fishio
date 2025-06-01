namespace Fishio.Domain.Entities;

public class Fishery : BaseAuditableEntity
{
    public string Name { get; private set; } = string.Empty;
    public string? ImageUrl { get; private set; }
    public string? ImagePublicId { get; private set; } // Cloudinary PublicId for image management
    public string? Location { get; private set; }

    public int? UserId { get; private set; } // Creator/Maintainer
    public virtual User? User { get; private set; }

    public virtual ICollection<LogbookEntry> LogbookEntries { get; private set; } = [];

    private readonly List<FishSpecies> _fishSpecies = [];
    public virtual IReadOnlyCollection<FishSpecies> FishSpecies => _fishSpecies.AsReadOnly();
    public virtual ICollection<Competition> Competitions { get; private set; } = [];

    private Fishery() { }

    public Fishery(int? userId, string name, string? location, string? imageUrl, string? imagePublicId = null) // UserId może być null, jeśli łowisko globalne
    {
        Guard.Against.NullOrWhiteSpace(name, nameof(name), "Nazwa łowiska jest wymagana.");

        Name = name;
        UserId = userId;
        Location = location;
        ImageUrl = imageUrl;
        ImagePublicId = imagePublicId;
    }

    public void UpdateDetails(string name, string? location, string? imageUrl, string? imagePublicId = null /*, User modifyingUser */)
    {
        // TODO: Dodać walidację uprawnień modifyingUser
        Guard.Against.NullOrWhiteSpace(name, nameof(name));
        Name = name;
        Location = location;
        ImageUrl = imageUrl;
        ImagePublicId = imagePublicId;
    }

    /// <summary>
    /// Clears the image URL and PublicId (for image removal scenarios)
    /// </summary>
    public void ClearImage()
    {
        ImageUrl = null;
        ImagePublicId = null;
    }

    /// <summary>
    /// Sets new image metadata
    /// </summary>
    public void SetImage(string imageUrl, string? imagePublicId = null)
    {
        Guard.Against.NullOrWhiteSpace(imageUrl, nameof(imageUrl));
        ImageUrl = imageUrl;
        ImagePublicId = imagePublicId;
    }

    public void AddSpecies(FishSpecies species /*, User modifyingUser */)
    {
        // TODO: Dodać walidację uprawnień modifyingUser
        Guard.Against.Null(species, nameof(species));
        if (!_fishSpecies.Any(fs => fs.Id == species.Id))
        {
            _fishSpecies.Add(species);
        }
    }

    public void RemoveSpecies(FishSpecies species /*, User modifyingUser */)
    {
        // TODO: Dodać walidację uprawnień modifyingUser
        Guard.Against.Null(species, nameof(species));
        var existingSpecies = _fishSpecies.FirstOrDefault(fs => fs.Id == species.Id);
        if (existingSpecies != null)
        {
            _fishSpecies.Remove(existingSpecies);
        }
    }

    public void UpdateSpeciesList(IEnumerable<FishSpecies> newSpeciesList /*, User modifyingUser */)
    {
        // TODO: Dodać walidację uprawnień modifyingUser
        Guard.Against.Null(newSpeciesList, nameof(newSpeciesList));

        _fishSpecies.Clear();
        foreach (var species in newSpeciesList.DistinctBy(s => s.Id)) // Upewnij się, że nie ma duplikatów
        {
            _fishSpecies.Add(species);
        }
    }
}
