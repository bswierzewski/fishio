using Fishio.Application.Users.Queries.GetCurrentUser;
using Fishio.Application.Users.Queries.SearchUsers;

namespace Fishio.API.Endpoints;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/users")
            .WithTags("Users")
            .WithOpenApi()
            .RequireAuthorization();

        group.MapGet("/me", GetCurrentUser)
            .WithName(nameof(GetCurrentUser))
            .Produces<CurrentUserDto>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        group.MapGet("/search", SearchAvailableUsers)
            .WithName(nameof(SearchAvailableUsers));
    }

    private static async Task<IResult> GetCurrentUser(ISender sender, CancellationToken ct)
    {
        var query = new GetCurrentUserQuery();
        var currentUser = await sender.Send(query, ct);
        return TypedResults.Ok(currentUser);
    }

    private static async Task<IResult> SearchAvailableUsers(ISender sender, [AsParameters] SearchUsersQuery query, CancellationToken ct)
    {
        var users = await sender.Send(query, ct);
        return TypedResults.Ok(users);
    }
}
