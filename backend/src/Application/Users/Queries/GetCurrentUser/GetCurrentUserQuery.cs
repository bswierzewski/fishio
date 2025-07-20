using MediatR;

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
}