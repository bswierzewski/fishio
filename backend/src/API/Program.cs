using Fishio.Application;
using Fishio.Infrastructure;
using Fishio.API;
using Fishio.API.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services from all layers
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddAPI(builder.Configuration, builder.Environment);

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Fishio API V1");
        c.RoutePrefix = string.Empty; // Serve Swagger UI at the root
    });

    app.UseCors(); // Uses default policy configured in AddAPI
}

// Add custom exception handling
app.UseExceptionHandler();

app.UseAuthentication();
app.UseMiddleware<UserSyncMiddleware>(); // Synchronize user data with database after authentication
app.UseAuthorization();

// Health check endpoint
app.MapGet("/api/health", () =>
{
    return Results.Ok(new { Status = "Healthy", Timestamp = DateTime.UtcNow });
})
.WithName("HealthCheck")
.WithOpenApi();

// Map minimal API endpoints (no controllers needed)

app.Run();
