using MediatR;
using Fishio.Application.Users.Queries.GetCurrentUser;

namespace Fishio.API.Endpoints;

public static class UserEndpoints
{
    public static void MapUserApi(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/users")
            .WithTags("Users")
            .WithOpenApi();

        group.MapGet("/me", GetCurrentUser)
            .WithName("GetCurrentUser")
            .WithSummary("Pobiera informacje o aktualnie zalogowanym użytkowniku")
            .RequireAuthorization();
    }

    private static async Task<IResult> GetCurrentUser(ISender sender)
    {
        var query = new GetCurrentUserQuery();
        var result = await sender.Send(query);
        return TypedResults.Ok(result);
    }
}