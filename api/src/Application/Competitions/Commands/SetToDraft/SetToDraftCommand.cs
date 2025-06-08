using MediatR;

namespace Fishio.Application.Competitions.Commands.SetToDraft;

public class SetToDraftCommand : IRequest
{
    public int CompetitionId { get; set; }
    public string Reason { get; set; } = string.Empty;
}