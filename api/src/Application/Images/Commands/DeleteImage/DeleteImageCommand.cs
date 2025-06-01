namespace Fishio.Application.Images.Commands.DeleteImage;

public class DeleteImageCommand : IRequest<bool>
{
    public string PublicId { get; set; } = string.Empty;
}

public class DeleteImageCommandValidator : AbstractValidator<DeleteImageCommand>
{
    public DeleteImageCommandValidator()
    {
        RuleFor(x => x.PublicId)
            .NotEmpty().WithMessage("PublicId zdjęcia jest wymagane.");
    }
}