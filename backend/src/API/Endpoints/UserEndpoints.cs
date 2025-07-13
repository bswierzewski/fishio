using MediatR;
using Fishio.Application.Users.Queries.GetCurrentUser;
using Fishio.Application.Users.Commands.UpdateUserProfile;
using Microsoft.AspNetCore.Authorization;

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

        group.MapPut("/me", UpdateUserProfile)
            .WithName("UpdateUserProfile")
            .WithSummary("Aktualizuje profil aktualnie zalogowanego użytkownika")
            .RequireAuthorization();

        group.MapGet("/me/status", GetUserStatus)
            .WithName("GetUserStatus")
            .WithSummary("Sprawdza status uwierzytelnienia użytkownika")
            .RequireAuthorization();
    }

    private static async Task<IResult> GetCurrentUser(ISender sender)
    {
        var query = new GetCurrentUserQuery();
        var result = await sender.Send(query);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> UpdateUserProfile(
        ISender sender,
        UpdateUserProfileCommand command)
    {
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    private static IResult GetUserStatus(HttpContext context)
    {
        var user = context.User;
        return TypedResults.Ok(new
        {
            IsAuthenticated = user.Identity?.IsAuthenticated ?? false,
            ClerkId = user.Claims.FirstOrDefault(c => c.Type == "sub")?.Value,
            Email = user.Claims.FirstOrDefault(c => c.Type == "email")?.Value,
            FirstName = user.Claims.FirstOrDefault(c => c.Type == "given_name")?.Value,
            LastName = user.Claims.FirstOrDefault(c => c.Type == "family_name")?.Value,
            Claims = user.Claims.Select(c => new { c.Type, c.Value }).ToList()
        });
    }
}