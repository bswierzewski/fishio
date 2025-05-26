namespace Fishio.Application.Competitions.Commands.AddParticipant;

public class AddParticipantCommand : IRequest<int> // Zwraca ID CompetitionParticipant
{
    public int CompetitionId { get; set; }
    public int? UserId { get; set; } // ID zarejestrowanego użytkownika (opcjonalne)
    public string? GuestName { get; set; } // Imię gościa (jeśli UserId jest null)
    public ParticipantRole Role { get; set; } = ParticipantRole.Competitor; // Domyślnie zawodnik
}

public class AddParticipantCommandValidator : AbstractValidator<AddParticipantCommand>
{
    private readonly IApplicationDbContext _context;

    public AddParticipantCommandValidator(IApplicationDbContext context)
    {
        _context = context;

        RuleFor(v => v.CompetitionId).NotEmpty();

        When(v => v.UserId.HasValue, () =>
        {
            RuleFor(v => v.UserId)
                .GreaterThan(0).WithMessage("Nieprawidłowe ID użytkownika.")
                .MustAsync(UserMustExist).WithMessage("Wybrany użytkownik nie istnieje.");
            RuleFor(v => v.GuestName).Empty().WithMessage("Nie podawaj nazwy gościa, jeśli podajesz ID użytkownika.");
        }).Otherwise(() =>
        {
            RuleFor(v => v.GuestName)
                .NotEmpty().WithMessage("Nazwa gościa jest wymagana, jeśli nie podano ID użytkownika.")
                .MaximumLength(200).WithMessage("Nazwa gościa nie może przekraczać 200 znaków.");
        });

        RuleFor(v => v.Role)
            .IsInEnum().WithMessage("Nieprawidłowa rola uczestnika.")
            .Must(role => role == ParticipantRole.Competitor)
                .When(v => !v.UserId.HasValue)
                .WithMessage("Gość może mieć tylko rolę Competitor.");
        // Organizator może przypisać rolę Judge tylko zarejestrowanemu użytkownikowi (obsłużone w AssignJudge)
    }

    private async Task<bool> UserMustExist(int? userId, CancellationToken cancellationToken)
    {
        if (!userId.HasValue) return true;
        return await _context.Users.AnyAsync(u => u.Id == userId.Value, cancellationToken);
    }
}
