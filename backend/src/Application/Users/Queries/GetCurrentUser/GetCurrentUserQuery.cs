using MediatR;
using Fishio.Domain.Enums;

namespace Fishio.Application.Users.Queries.GetCurrentUser;

public record GetCurrentUserQuery : IRequest<UserDto>;

public class UserDto
{
    public int Id { get; set; }
    public string ClerkId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateTime? DateOfBirth { get; set; }
    public Gender? Gender { get; set; }
    public UserRole Role { get; set; }
    public string? ProfileDescription { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public bool NotificationsEnabled { get; set; }
    public DateTimeOffset Created { get; set; }
    public DateTimeOffset? LastModified { get; set; }
    public int? Age { get; set; }
}