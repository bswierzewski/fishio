
using Fishio.Application.Common.Interfaces;
using MediatR.Pipeline;
using Microsoft.Extensions.Logging;

namespace Fishio.Application.Common.Behaviours;

public class LoggingBehaviour<TRequest> : IRequestPreProcessor<TRequest> where TRequest : notnull
{
    private readonly ILogger _logger;
    private readonly ICurrentUserService _user;

    public LoggingBehaviour(ILogger<TRequest> logger, ICurrentUserService user)
    {
        _logger = logger;
        _user = user;
    }

    public Task Process(TRequest request, CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        var userId = _user.UserId ?? 0;
        string? userName = string.Empty;

        _logger.LogInformation("CleanArchitecture Request: {Name} {@UserId} {@UserName} {@Request}",
            requestName, userId, userName, request);

        return Task.CompletedTask;
    }
}
