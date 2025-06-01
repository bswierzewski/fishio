using Fishio.Application.Common.Models;
using Fishio.Application.Fisheries.Commands.CreateFishery;
using Fishio.Application.Fisheries.Commands.DeleteFishery;
using Fishio.Application.Fisheries.Commands.UpdateFishery;
using Fishio.Application.Fisheries.Queries.GetFisheryDetails;
using Fishio.Application.Fisheries.Queries.ListFisheries;

namespace Fishio.API.Endpoints;

public static class FisheriesEndpoints
{
    public static void MapFisheriesEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/fisheries")
            .WithTags("Fisheries")
            .WithOpenApi();

        group.MapGet("/", GetAllFisheries)
            .WithName(nameof(GetAllFisheries))
            .Produces<PaginatedList<FisheryDto>>(StatusCodes.Status200OK);

        group.MapGet("/{id:int}", GetFisheryById)
            .WithName(nameof(GetFisheryById))
            .Produces<FisheryDetailsDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPost("/", CreateFishery)
            .WithName(nameof(CreateFishery))
            .Produces<object>(StatusCodes.Status201Created)
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status500InternalServerError)
            .RequireAuthorization();

        group.MapPut("/{id:int}", UpdateExistingFishery)
            .WithName(nameof(UpdateExistingFishery))
            .Produces(StatusCodes.Status204NoContent)
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .RequireAuthorization();

        group.MapDelete("/{id:int}", DeleteExistingFishery)
            .WithName(nameof(DeleteExistingFishery))
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
    }

    private static async Task<IResult> GetAllFisheries(ISender sender, [AsParameters] GetFisheriesListQuery query, CancellationToken ct)
    {
        var fisheries = await sender.Send(query, ct);
        return TypedResults.Ok(fisheries);
    }

    private static async Task<IResult> GetFisheryById(ISender sender, int id, CancellationToken ct)
    {
        var query = new GetFisheryDetailsQuery(id);
        var fishery = await sender.Send(query, ct);
        return fishery != null ? TypedResults.Ok(fishery) : TypedResults.NotFound();
    }

    private static async Task<IResult> CreateFishery(ISender sender, CreateFisheryCommand command, CancellationToken ct)
    {
        var fisheryId = await sender.Send(command, ct);
        return TypedResults.Created($"/api/fisheries/{fisheryId}", new { Id = fisheryId });
    }

    private static async Task<IResult> UpdateExistingFishery(ISender sender, int id, UpdateFisheryCommand command, CancellationToken ct)
    {
        if (id != command.Id)
        {
            return TypedResults.BadRequest("ID w ścieżce nie zgadza się z ID w ciele żądania.");
        }
        var success = await sender.Send(command, ct);
        return success ? TypedResults.NoContent() : TypedResults.Problem("Aktualizacja nie powiodła się.");
    }

    private static async Task<IResult> DeleteExistingFishery(ISender sender, int id, CancellationToken ct)
    {
        var command = new DeleteFisheryCommand(id);
        var success = await sender.Send(command, ct);
        return TypedResults.NoContent();
    }
}
