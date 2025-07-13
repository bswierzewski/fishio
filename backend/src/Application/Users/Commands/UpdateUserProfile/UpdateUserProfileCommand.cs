using MediatR;
using Fishio.Domain.Enums;
using FluentValidation;

namespace Fishio.Application.Users.Commands.UpdateUserProfile;

public record UpdateUserProfileCommand(
    string FirstName,
    string LastName,
    string? ProfileDescription,
    DateTime? DateOfBirth,
    Gender? Gender,
    bool NotificationsEnabled
) : IRequest;

public class UpdateUserProfileCommandValidator : AbstractValidator<UpdateUserProfileCommand>
{
    public UpdateUserProfileCommandValidator()
    {
        RuleFor(v => v.FirstName)
            .NotEmpty().WithMessage("Imię jest wymagane.")
            .MaximumLength(50).WithMessage("Imię nie może przekraczać 50 znaków.");

        RuleFor(v => v.LastName)
            .NotEmpty().WithMessage("Nazwisko jest wymagane.")
            .MaximumLength(50).WithMessage("Nazwisko nie może przekraczać 50 znaków.");

        RuleFor(v => v.ProfileDescription)
            .MaximumLength(1000).WithMessage("Opis profilu nie może przekraczać 1000 znaków.");

        RuleFor(v => v.DateOfBirth)
            .LessThan(DateTime.Today).WithMessage("Data urodzenia musi być w przeszłości.")
            .GreaterThan(DateTime.Today.AddYears(-120)).WithMessage("Data urodzenia nie może być wcześniejsza niż 120 lat temu.");
    }
}