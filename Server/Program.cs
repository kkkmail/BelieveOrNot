// Program.cs
using BelieveOrNot.Server.BelieveOrNot;
using BelieveOrNot.Server.King;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Add Windows service support
builder.Host.UseWindowsService();

// Add configuration
builder.Services.Configure<GameSettings>(
    builder.Configuration.GetSection("GameSettings"));

// Add services for BelieveOrNot
builder.Services.AddSignalR();
builder.Services.AddSingleton<IMatchManager, MatchManager>();
builder.Services.AddSingleton<IGameEngine, GameEngine>();

// Add services for King
builder.Services.AddSingleton<IKingMatchManager, KingMatchManager>();
builder.Services.AddSingleton<IKingGameEngine, KingGameEngine>();

builder.Services.AddCors(options =>
{
    var corsOrigin = builder.Configuration.GetValue<string>("ServerSettings:DefaultCorsOrigin") ?? "*";
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseCors();

var staticFilesEnabled = app.Configuration.GetValue<bool>("ServerSettings:StaticFilesEnabled", true);
if (staticFilesEnabled)
{
    app.UseDefaultFiles();
    app.UseStaticFiles();

    // Add static file serving for King game subfolder (for CSS/JS files only)
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(
            Path.Combine(builder.Environment.WebRootPath, "king")),
        RequestPath = "/king"
    });
}

// Map hubs for both games - use different paths to avoid conflicts
var hubPath = app.Configuration.GetValue<string>("ServerSettings:SignalRHubPath") ?? "/game";
app.MapHub<GameHub>(hubPath);
app.MapHub<KingHub>("/kingHub");

// Add API endpoints to check match existence for routing
app.MapPost("/game/check-match", (MatchCheckRequest request, IMatchManager matchManager) =>
{
    if (!Guid.TryParse(request.MatchId, out var matchId))
    {
        return Results.Ok(new { exists = false });
    }

    var match = matchManager.GetMatch(matchId);
    return Results.Ok(new { exists = match != null });
});

app.MapPost("/king/check-match", (MatchCheckRequest request, IKingMatchManager matchManager) =>
{
    if (!Guid.TryParse(request.MatchId, out var matchId))
    {
        return Results.Ok(new { exists = false });
    }

    var match = matchManager.GetMatch(matchId);
    return Results.Ok(new { exists = match != null });
});

app.Run();