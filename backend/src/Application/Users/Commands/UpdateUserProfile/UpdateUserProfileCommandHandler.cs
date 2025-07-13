using MediatR;
using Fishio.Application.Common.Interfaces;
using Fishio.Application.Common.Exceptions;

namespace Fishio.Application.Users.Commands.UpdateUserProfile;

public class UpdateUserProfileCommandHandler : IRequestHandler<UpdateUserProfileCommand>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _dbContext;

    public UpdateUserProfileCommandHandler(
        ICurrentUserService currentUserService,
        IApplicationDbContext dbContext)
    {
        _currentUserService = currentUserService;
        _dbContext = dbContext;
    }

    public async Task Handle(UpdateUserProfileCommand request, CancellationToken cancellationToken)
    {
        var user = await _currentUserService.GetCurrentUserAsync(cancellationToken);

        if (user == null)
            throw new NotFoundException("Użytkownik nie został znaleziony.");

        user.UpdateProfile(request.FirstName, request.LastName);
        user.UpdateOptionalData(request.DateOfBirth, request.Gender);
        user.UpdateProfileDescription(request.ProfileDescription);
        user.SetNotifications(request.NotificationsEnabled);

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}