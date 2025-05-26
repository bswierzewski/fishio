namespace Fishio.Application.Users.Queries.GetCurrentUser;

public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, CurrentUserDto>
{
    private readonly ICurrentUserService _currentUserService;

    public GetCurrentUserQueryHandler(ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
    }

    public async Task<CurrentUserDto> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        var currentUser = await _currentUserService.GetOrProvisionDomainUserAsync(cancellationToken);

        if (currentUser == null)
        {
            throw new UnauthorizedAccessException("User is not authenticated or could not be provisioned.");
        }

        return new CurrentUserDto
        {
            Id = currentUser.Id,
            ClerkUserId = currentUser.ClerkUserId,
            Name = currentUser.Name,
            Email = currentUser.Email,
            ImageUrl = currentUser.ImageUrl
        };
    }
}