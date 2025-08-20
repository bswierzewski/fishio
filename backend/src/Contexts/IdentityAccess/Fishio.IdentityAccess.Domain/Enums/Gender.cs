using System.ComponentModel.DataAnnotations;

namespace Fishio.IdentityAccess.Domain.Enums;

/// <summary>
/// Represents the gender of a user
/// </summary>
public enum Gender
{
    /// <summary>
    /// Male gender
    /// </summary>
    [Display(Name = "Mężczyzna")]
    Male,

    /// <summary>
    /// Female gender
    /// </summary>
    [Display(Name = "Kobieta")]
    Female
}