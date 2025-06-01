namespace Fishio.Application.Images.Commands.DeleteImage;

public class DeleteImageCommandHandler : IRequestHandler<DeleteImageCommand, bool>
{
    private readonly ICurrentUserService _currentUserService;

    public DeleteImageCommandHandler(ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(DeleteImageCommand request, CancellationToken cancellationToken)
    {
        var currentUser = await _currentUserService.GetOrProvisionDomainUserAsync(cancellationToken);
        if (currentUser == null || currentUser.Id == 0)
        {
            throw new UnauthorizedAccessException("Użytkownik musi być zalogowany, aby usunąć zdjęcie.");
        }

        // TODO: Implement proper Cloudinary deletion through Infrastructure layer
        // For now, we'll return true as the client handles deletion directly
        // In the future, this could be implemented as a background job or through a proper service
        return true;
    }
}