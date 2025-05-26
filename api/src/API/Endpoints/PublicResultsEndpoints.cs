using Fishio.Application.PublicResults.Queries.GetPublicCompetitionResults;
using Microsoft.AspNetCore.Mvc;

namespace Fishio.API.Endpoints;

public static class PublicResultsEndpoints
{
    public static void MapPublicResultsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/results")
            .WithTags("PublicResults")
            .WithOpenApi();

        group.MapGet("/{token}", GetResultsByToken)
            .WithName(nameof(GetResultsByToken))
            .Produces<PublicCompetitionResultsDto?>(StatusCodes.Status200OK);
    }

    private static async Task<IResult> GetResultsByToken(ISender sender, [FromRoute] string token, CancellationToken ct)
    {
        var query = new GetPublicCompetitionResultsQuery(token);
        var results = await sender.Send(query, ct);
        return TypedResults.Ok(results);
    }
}
