﻿using Fishio.Application.Common.Exceptions;
using Fishio.Domain.ValueObjects;

namespace Fishio.Application.Competitions.Commands.UpdateCompetition;

public class UpdateCompetitionCommandHandler : IRequestHandler<UpdateCompetitionCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateCompetitionCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(UpdateCompetitionCommand request, CancellationToken cancellationToken)
    {
        var competitionToUpdate = await _context.Competitions
            .Include(c => c.Categories)
            .ThenInclude(cc => cc.CategoryDefinition)
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (competitionToUpdate == null)
        {
            throw new NotFoundException(nameof(Competition), request.Id.ToString());
        }

        var currentUser = await _currentUserService.GetOrProvisionDomainUserAsync(cancellationToken);
        if (competitionToUpdate.OrganizerId != currentUser?.Id)
        {
            throw new ForbiddenAccessException();
        }

        // Sprawdź, czy zawody można jeszcze edytować (np. nie rozpoczęły się)
        if (competitionToUpdate.Status == CompetitionStatus.Ongoing || competitionToUpdate.Status == CompetitionStatus.Finished)
        {
            throw new InvalidOperationException("Nie można edytować zawodów, które już się rozpoczęły lub zakończyły.");
        }

        var fishery = await _context.Fisheries.FindAsync(new object[] { request.FisheryId }, cancellationToken);
        if (fishery == null)
        {
            throw new NotFoundException(nameof(Fishery), request.FisheryId.ToString());
        }

        string? newImageUrl = competitionToUpdate.ImageUrl;
        string? newImagePublicId = competitionToUpdate.ImagePublicId;

        if (request.RemoveCurrentImage && !string.IsNullOrEmpty(competitionToUpdate.ImageUrl))
        {
            newImageUrl = null;
            newImagePublicId = null;
        }

        if (!string.IsNullOrEmpty(request.ImageUrl))
        {
            // Use the provided image URL
            newImageUrl = request.ImageUrl;
            newImagePublicId = request.ImagePublicId;
        }

        // Convert to UTC to avoid PostgreSQL timezone issues
        var startTimeUtc = request.StartTime.ToUniversalTime();
        var endTimeUtc = request.EndTime.ToUniversalTime();
        var newSchedule = new DateTimeRange(startTimeUtc, endTimeUtc);

        competitionToUpdate.UpdateDetails(
            name: request.Name,
            schedule: newSchedule,
            type: request.Type,
            fishery: fishery,
            rules: request.Rules,
            imageUrl: newImageUrl,
            imagePublicId: newImagePublicId
        );

        // TODO: Handle category updates if needed

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
