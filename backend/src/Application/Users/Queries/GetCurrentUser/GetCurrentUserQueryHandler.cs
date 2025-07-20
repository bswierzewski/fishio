using MediatR;
using Fishio.Application.Common.Interfaces;
using Fishio.Application.Common.Exceptions;

namespace Fishio.Application.Users.Queries.GetCurrentUser;

public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, UserDto>
{
    private readonly ICurrentUserService _currentUserService;

    public GetCurrentUserQueryHandler(ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
    }

    public async Task<UserDto> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        var user = await _currentUserService.GetCurrentUserAsync(cancellationToken);

        if (user == null)
            throw new NotFoundException("Użytkownik nie został znaleziony.");

        return new UserDto
        {
            Id = user.Id,
            ClerkId = user.ClerkId,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.GetFullName(),
        };
    }
}