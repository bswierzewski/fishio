# Coding Rules for Fishio Project

## Language and Comments

1. **Add comments for created and existing code in English** - All code comments should be written in English for consistency and maintainability.

2. **Create enums with English names but include DisplayAttribute with Polish names** - Enums should have English identifiers but use DisplayAttribute to provide Polish display names for the user interface.

3. **Error messages and user-facing content should be in Polish** - All messages, error texts, and content that users will see should be written in Polish.

4. **All code should be written in English except for user-visible messages and error content** - Code identifiers, variable names, method names, classes, etc. should be in English, with the exception of user-facing strings and error messages which should be in Polish.

## Example

```csharp
// English enum with Polish DisplayAttribute
public enum FishStatus
{
    [Display(Name = "Aktywny")]
    Active,

    [Display(Name = "Nieaktywny")]
    Inactive,

    [Display(Name = "Usunięty")]
    Deleted
}

// Error message in Polish for users
throw new ValidationException("Nazwa ryby jest wymagana");

// Comments in English
/// <summary>
/// Calculates the fish weight based on length and species
/// </summary>
public decimal CalculateFishWeight(decimal length, FishSpecies species)
{
    // Implementation with English comments
    return length * species.WeightMultiplier;
}
```
