// Program.cs
using BelieveOrNot.Server.BelieveOrNot;
using BelieveOrNot.Server.Endpoints;
using BelieveOrNot.Server.King;
using BelieveOrNot.Server.Services;
using BelieveOrNot.Server.Sse;

var builder = WebApplication.CreateBuilder(args);

// Add Windows service support
builder.Host.UseWindowsService();

// Add configuration
builder.Services.Configure<GameSettings>(
    builder.Configuration.GetSection("GameSettings"));

// Add Razor Pages
builder.Services.AddRazorPages();

// Add services for BelieveOrNot
builder.Services.AddSingleton<IMatchManager, MatchManager>();
builder.Services.AddSingleton<IGameEngine, GameEngine>();

// Add services for King
builder.Services.AddSingleton<IKingMatchManager, KingMatchManager>();
builder.Services.AddSingleton<IKingGameEngine, KingGameEngine>();
builder.Services.AddSingleton<IKingEventBroadcaster, KingEventBroadcaster>();

// Add SSE infrastructure
builder.Services.AddSingleton<ISseConnectionManager, SseConnectionManager>();
builder.Services.AddSingleton<ISseBroadcaster, SseBroadcaster>();

// Add Razor rendering services for endpoints
builder.Services.AddScoped<IRazorPartialRenderer, RazorPartialRenderer>();
builder.Services.AddScoped<IBonViewRenderer, BonViewRenderer>();
builder.Services.AddScoped<IKingViewRenderer, KingViewRenderer>();

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

// Player ID cookie middleware - generates a persistent player identity
app.Use(async (context, next) =>
{
    if (!context.Request.Cookies.ContainsKey("PlayerId"))
    {
        var playerId = Guid.NewGuid().ToString();
        context.Response.Cookies.Append("PlayerId", playerId, new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Strict,
            MaxAge = TimeSpan.FromDays(365),
            Path = "/"
        });
    }
    await next();
});

var staticFilesEnabled = app.Configuration.GetValue<bool>("ServerSettings:StaticFilesEnabled", true);
if (staticFilesEnabled)
{
    app.UseStaticFiles();
}

app.MapRazorPages();

// Map HTTP POST endpoints
app.MapBonEndpoints();
app.MapKingEndpoints();

// SSE endpoint for BelieveOrNot real-time updates
app.MapGet("/bon/sse", async (HttpContext context, ISseConnectionManager sseManager,
    IMatchManager matchManager, ISseBroadcaster broadcaster, IBonViewRenderer viewRenderer) =>
{
    if (!Guid.TryParse(context.Request.Query["matchId"], out var matchId) ||
        !Guid.TryParse(context.Request.Query["playerId"], out var playerId))
    {
        context.Response.StatusCode = 400;
        return;
    }

    context.Response.ContentType = "text/event-stream";
    context.Response.Headers.CacheControl = "no-cache";
    context.Response.Headers.Connection = "keep-alive";

    var cts = CancellationTokenSource.CreateLinkedTokenSource(context.RequestAborted);
    sseManager.AddConnection(playerId, matchId, context.Response, cts);

    // Send initial connection confirmation
    await context.Response.WriteAsync($"event: connected\ndata: ok\n\n", cts.Token);
    await context.Response.Body.FlushAsync(cts.Token);

    try
    {
        // Keep the connection open until cancelled
        await Task.Delay(Timeout.Infinite, cts.Token);
    }
    catch (OperationCanceledException)
    {
        // Expected when connection closes
    }
    finally
    {
        sseManager.RemoveConnection(playerId);

        // Handle disconnect: mark player as disconnected and notify others
        var match = matchManager.GetMatch(matchId);
        if (match != null)
        {
            var player = match.Players.FirstOrDefault(p => p.Id == playerId);
            if (player != null)
            {
                player.IsConnected = false;
                player.LastSeen = DateTime.UtcNow;

                var disconnectEvent = GameEventFactory.CreateConnectionEvent(player.Name, false);
                var eventHtml = await viewRenderer.RenderEventLogEntryAsync(disconnectEvent);
                await broadcaster.SendToMatchAsync(matchId, "game-event", _ => eventHtml);

                // Send updated state to remaining players
                var connections = sseManager.GetConnectionsForMatch(matchId).ToList();
                var rendered = new Dictionary<Guid, string>();
                foreach (var conn in connections)
                {
                    rendered[conn.PlayerId] = await viewRenderer.RenderStateUpdateAsync(match, conn.PlayerId);
                }
                await broadcaster.SendToMatchAsync(matchId, "state-update",
                    pid => rendered.GetValueOrDefault(pid, ""));
            }
        }
    }
});

// SSE endpoint for King real-time updates
app.MapGet("/king/sse", async (HttpContext context, ISseConnectionManager sseManager,
    IKingMatchManager matchManager, ISseBroadcaster broadcaster, IKingViewRenderer viewRenderer) =>
{
    if (!Guid.TryParse(context.Request.Query["matchId"], out var matchId) ||
        !Guid.TryParse(context.Request.Query["playerId"], out var playerId))
    {
        context.Response.StatusCode = 400;
        return;
    }

    context.Response.ContentType = "text/event-stream";
    context.Response.Headers.CacheControl = "no-cache";
    context.Response.Headers.Connection = "keep-alive";

    var cts = CancellationTokenSource.CreateLinkedTokenSource(context.RequestAborted);
    sseManager.AddConnection(playerId, matchId, context.Response, cts);

    // Send initial connection confirmation
    await context.Response.WriteAsync($"event: connected\ndata: ok\n\n", cts.Token);
    await context.Response.Body.FlushAsync(cts.Token);

    try
    {
        await Task.Delay(Timeout.Infinite, cts.Token);
    }
    catch (OperationCanceledException)
    {
        // Expected when connection closes
    }
    finally
    {
        sseManager.RemoveConnection(playerId);

        // Handle disconnect: mark player as disconnected and notify others
        var match = matchManager.GetMatch(matchId);
        if (match != null)
        {
            var player = match.Players.FirstOrDefault(p => p.Id == playerId);
            if (player != null)
            {
                player.IsConnected = false;
                player.LastSeen = DateTime.UtcNow;

                var disconnectEvent = GameEventFactory.CreateConnectionEvent(player.Name, false);
                var eventHtml = await viewRenderer.RenderEventLogEntryAsync(disconnectEvent);
                await broadcaster.SendToMatchAsync(matchId, "game-event", _ => eventHtml);

                // Send updated state to remaining players
                var connections = sseManager.GetConnectionsForMatch(matchId).ToList();
                var rendered = new Dictionary<Guid, string>();
                foreach (var conn in connections)
                {
                    rendered[conn.PlayerId] = await viewRenderer.RenderStateUpdateAsync(match, conn.PlayerId);
                }
                await broadcaster.SendToMatchAsync(matchId, "state-update",
                    pid => rendered.GetValueOrDefault(pid, ""));
            }
        }
    }
});

app.Run();
