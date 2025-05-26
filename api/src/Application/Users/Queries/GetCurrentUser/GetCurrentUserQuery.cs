namespace Fishio.Application.Users.Queries.GetCurrentUser;

public record GetCurrentUserQuery : IRequest<CurrentUserDto>;

public class CurrentUserDto
{
    /// <summary>
    /// The domain user ID (primary key in the Users table)
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// The Clerk user ID (external identity provider ID)
    /// </summary>
    public string ClerkUserId { get; set; } = string.Empty;

    /// <summary>
    /// The user's display name
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// The user's email address
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// The user's profile image URL
    /// </summary>
    public string? ImageUrl { get; set; }
}