using Fishio.Application.Images.Commands.DeleteImage;
using Fishio.Application.Images.Queries.GetUploadSignature;

namespace Fishio.API.Endpoints;

public static class ImageEndpoints
{
    public static void MapImageEndpoints(this IEndpointRouteBuilder app)
    {
        var imagesGroup = app.MapGroup("/api/images")
            .WithTags("Images")
            .WithOpenApi()
            .RequireAuthorization();

        // Direct upload signature endpoint
        imagesGroup.MapGet("/upload-signature", GetUploadSignature)
            .WithName(nameof(GetUploadSignature))
            .Produces<UploadSignatureResult>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        imagesGroup.MapDelete("/{publicId}", DeleteImage)
            .WithName(nameof(DeleteImage))
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> GetUploadSignature(
        ISender sender,
        [AsParameters] GetUploadSignatureQuery query,
        CancellationToken ct)
    {
        var result = await sender.Send(query, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> DeleteImage(
        ISender sender,
        string publicId,
        CancellationToken ct)
    {
        var command = new DeleteImageCommand { PublicId = publicId };
        var success = await sender.Send(command, ct);

        if (!success)
        {
            return TypedResults.NotFound("Zdjęcie nie zostało znalezione lub nie udało się go usunąć.");
        }

        return TypedResults.NoContent();
    }
}