// TODO: Add using statements for all context APIs when they are implemented
// using Fishio.IdentityAccess.Api;
// using Fishio.IdentityAccess.Infrastructure;
// using Fishio.Competitions.Api;
// using Fishio.Competitions.Infrastructure;
// using Fishio.Scoring.Api;
// using Fishio.Scoring.Infrastructure;
// using Fishio.LiveEvent.Api;
// using Fishio.LiveEvent.Infrastructure;
// using Fishio.Venues.Api;
// using Fishio.Venues.Infrastructure;
// using Fishio.Payments.Api;
// using Fishio.Payments.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// TODO: Register all context modules when they are implemented
// builder.Services
//     .AddIdentityAccessInfrastructure()
//     .AddIdentityAccessApi()
//     .AddCompetitionsInfrastructure()
//     .AddCompetitionsApi()
//     .AddScoringInfrastructure()
//     .AddScoringApi()
//     .AddLiveEventInfrastructure()
//     .AddLiveEventApi()
//     .AddVenuesInfrastructure()
//     .AddVenuesApi()
//     .AddPaymentsInfrastructure()
//     .AddPaymentsApi();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// TODO: Map endpoints from all contexts when they are implemented
// app.MapIdentityAccessEndpoints()
//    .MapCompetitionsEndpoints()
//    .MapScoringEndpoints()
//    .MapLiveEventEndpoints()
//    .MapVenuesEndpoints()
//    .MapPaymentsEndpoints();

// Temporary endpoint to verify ApiHost is working
app.MapGet("/", () => "Fishio ApiHost is running! 🐟🎣")
   .WithName("HealthCheck");

app.Run();