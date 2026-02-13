// Endpoints/KingEndpoints.cs
using BelieveOrNot.Server.BelieveOrNot;
using BelieveOrNot.Server.King;
using BelieveOrNot.Server.Services;
using BelieveOrNot.Server.Shared;
using BelieveOrNot.Server.Sse;

namespace BelieveOrNot.Server.Endpoints;

public static class KingEndpoints
{
    public static void MapKingEndpoints(this WebApplication app)
    {
        app.MapPost("/king/create", CreateMatch);
        app.MapPost("/king/join", JoinMatch);
        app.MapPost("/king/reconnect", ReconnectToMatch);
        app.MapPost("/king/start-round", StartRound);
        app.MapPost("/king/play-card", PlayCard);
        app.MapPost("/king/select-trump", SelectTrump);
        app.MapPost("/king/end-round", EndRound);
    }

    private static Guid? GetPlayerId(HttpContext context)
    {
        if (context.Request.Cookies.TryGetValue("PlayerId", out var value) && Guid.TryParse(value, out var id))
            return id;
        return null;
    }

    private static async Task BroadcastStatesAsync(
        KingMatch match, IKingViewRenderer viewRenderer, ISseBroadcaster broadcaster, ISseConnectionManager sseManager)
    {
        var connections = sseManager.GetConnectionsForMatch(match.Id).ToList();

        var rendered = new Dictionary<Guid, string>();

        foreach (var conn in connections)
        {
            rendered[conn.PlayerId] = await viewRenderer.RenderStateUpdateAsync(match, conn.PlayerId);
        }

        await broadcaster.SendToMatchAsync(match.Id, "state-update",
            playerId => rendered.GetValueOrDefault(playerId, ""));
    }

    private static async Task BroadcastEventAsync(
        KingMatch match, GameEventDto gameEvent, IKingViewRenderer viewRenderer, ISseBroadcaster broadcaster)
    {
        var html = await viewRenderer.RenderEventLogEntryAsync(gameEvent);
        await broadcaster.SendToMatchAsync(match.Id, "game-event", _ => html);
    }

    // POST /king/create
    private static async Task<IResult> CreateMatch(
        HttpContext context,
        IKingMatchManager matchManager,
        IKingViewRenderer viewRenderer,
        ISseBroadcaster broadcaster,
        ISseConnectionManager sseManager)
    {
        var playerId = GetPlayerId(context);
        if (playerId == null) return Results.BadRequest("Missing PlayerId cookie.");

        var form = await context.Request.ReadFormAsync();
        var playerName = form["playerName"].ToString();
        if (string.IsNullOrWhiteSpace(playerName)) return Results.BadRequest("Player name is required.");

        var settings = new KingGameSettings();

        try
        {
            var match = matchManager.CreateMatch(playerName, playerId.Value, settings);

            var welcomeEvent = new GameEventDto
            {
                Type = "System",
                DisplayMessage = "Welcome to King! Wait for other players to join (4 required)."
            };
            var createEvent = GameEventFactory.CreateJoinEvent(playerName, true);
            var shareEvent = new GameEventDto
            {
                Type = "System",
                DisplayMessage = "Game created! Share the URL or Match ID with others to join."
            };

            await BroadcastEventAsync(match, createEvent, viewRenderer, broadcaster);
            await BroadcastStatesAsync(match, viewRenderer, broadcaster, sseManager);

            context.Response.Headers["HX-Replace-Url"] = $"/king?match={match.Id}";

            var html = await viewRenderer.RenderAllRegionsAsync(match, playerId.Value);

            html += await viewRenderer.RenderEventLogEntryAsync(welcomeEvent);
            html += await viewRenderer.RenderEventLogEntryAsync(createEvent);
            html += await viewRenderer.RenderEventLogEntryAsync(shareEvent);

            return Results.Content(html, "text/html");
        }
        catch (Exception ex)
        {
            return Results.BadRequest(ex.Message);
        }
    }

    // POST /king/join
    private static async Task<IResult> JoinMatch(
        HttpContext context,
        IKingMatchManager matchManager,
        IKingViewRenderer viewRenderer,
        ISseBroadcaster broadcaster,
        ISseConnectionManager sseManager)
    {
        var playerId = GetPlayerId(context);
        if (playerId == null) return Results.BadRequest("Missing PlayerId cookie.");

        var form = await context.Request.ReadFormAsync();
        var matchIdStr = form["matchId"].ToString().Trim();
        var playerName = form["playerName"].ToString();

        // Extract GUID from pasted URL (e.g. http://host/king?match=<guid>)
        if (matchIdStr.Contains("match=", StringComparison.OrdinalIgnoreCase))
        {
            var idx = matchIdStr.IndexOf("match=", StringComparison.OrdinalIgnoreCase) + 6;
            var end = matchIdStr.IndexOf('&', idx);
            matchIdStr = end > 0 ? matchIdStr[idx..end] : matchIdStr[idx..];
        }

        if (!Guid.TryParse(matchIdStr, out var matchId))
            return Results.BadRequest("Invalid match ID.");
        if (string.IsNullOrWhiteSpace(playerName))
            return Results.BadRequest("Player name is required.");

        var match = matchManager.GetMatch(matchId);
        if (match == null) return Results.NotFound("Match not found.");
        if (match.Phase != GamePhase.WaitingForPlayers)
            return Results.BadRequest("Game has already started.");
        if (match.Players.Count >= 4)
            return Results.BadRequest("This King game is full (4 players maximum).");

        try
        {
            match = matchManager.JoinMatch(matchId, playerName, playerId.Value);
            var joinedPlayer = match.Players.Last();

            var joinEvent = GameEventFactory.CreateJoinEvent(joinedPlayer.Name, false);
            await BroadcastEventAsync(match, joinEvent, viewRenderer, broadcaster);
            await BroadcastStatesAsync(match, viewRenderer, broadcaster, sseManager);

            context.Response.Headers["HX-Replace-Url"] = $"/king?match={matchId}";

            var html = await viewRenderer.RenderAllRegionsAsync(match, playerId.Value);

            var welcomeEvent = new GameEventDto
            {
                Type = "System",
                DisplayMessage = "You joined the game. Wait for the host to start a round."
            };
            html += await viewRenderer.RenderEventLogEntryAsync(joinEvent);
            html += await viewRenderer.RenderEventLogEntryAsync(welcomeEvent);

            return Results.Content(html, "text/html");
        }
        catch (InvalidOperationException ex)
        {
            return Results.BadRequest(ex.Message);
        }
    }

    // POST /king/reconnect
    private static async Task<IResult> ReconnectToMatch(
        HttpContext context,
        IKingMatchManager matchManager,
        IKingViewRenderer viewRenderer,
        ISseBroadcaster broadcaster,
        ISseConnectionManager sseManager)
    {
        var playerId = GetPlayerId(context);
        if (playerId == null) return Results.BadRequest("Missing PlayerId cookie.");

        var form = await context.Request.ReadFormAsync();
        var matchIdStr = form["matchId"].ToString();

        if (!Guid.TryParse(matchIdStr, out var matchId))
            return Results.BadRequest("Invalid match ID.");

        var match = matchManager.GetMatch(matchId);
        if (match == null) return Results.NotFound("Match not found.");

        var player = match.Players.FirstOrDefault(p => p.Id == playerId.Value);
        if (player == null)
        {
            if (match.Phase != GamePhase.WaitingForPlayers)
                return Results.BadRequest("Game has started. Cannot join.");
            return Results.BadRequest("Player not found in this match.");
        }

        player.IsConnected = true;
        player.LastSeen = DateTime.UtcNow;

        var reconnectEvent = GameEventFactory.CreateConnectionEvent(player.Name, true);
        await BroadcastEventAsync(match, reconnectEvent, viewRenderer, broadcaster);
        await BroadcastStatesAsync(match, viewRenderer, broadcaster, sseManager);

        context.Response.Headers["HX-Replace-Url"] = $"/king?match={matchId}";

        var html = await viewRenderer.RenderAllRegionsAsync(match, playerId.Value);
        return Results.Content(html, "text/html");
    }

    // POST /king/start-round
    private static async Task<IResult> StartRound(
        HttpContext context,
        IKingMatchManager matchManager,
        IKingGameEngine gameEngine,
        IKingViewRenderer viewRenderer,
        ISseBroadcaster broadcaster,
        ISseConnectionManager sseManager)
    {
        var playerId = GetPlayerId(context);
        if (playerId == null) return Results.BadRequest("Missing PlayerId cookie.");

        var form = await context.Request.ReadFormAsync();
        var matchIdStr = form["matchId"].ToString();

        if (!Guid.TryParse(matchIdStr, out var matchId))
            return Results.BadRequest("Invalid match ID.");

        var match = matchManager.GetMatch(matchId);
        if (match == null) return Results.NotFound("Match not found.");

        if (playerId.Value != match.Players[0].Id)
            return Results.BadRequest("Only the match creator can start the round.");

        if (match.Players.Count != 4)
            return Results.BadRequest("King game requires exactly 4 players.");

        try
        {
            var state = gameEngine.StartNewRound(match);

            var roundStartEvent = new GameEventDto
            {
                Type = "RoundStart",
                DisplayMessage = $"🎮 Round {match.CurrentRoundIndex + 1} started: {match.CurrentRound?.Name ?? "Unknown"}"
            };
            await BroadcastEventAsync(match, roundStartEvent, viewRenderer, broadcaster);
            await BroadcastStatesAsync(match, viewRenderer, broadcaster, sseManager);

            var html = await viewRenderer.RenderStateUpdateAsync(match, playerId.Value);
            return Results.Content(html, "text/html");
        }
        catch (Exception ex)
        {
            return Results.BadRequest($"Failed to start round: {ex.Message}");
        }
    }

    // POST /king/play-card
    private static async Task<IResult> PlayCard(
        HttpContext context,
        IKingMatchManager matchManager,
        IKingGameEngine gameEngine,
        IKingEventBroadcaster eventBroadcaster,
        IKingViewRenderer viewRenderer,
        ISseBroadcaster broadcaster,
        ISseConnectionManager sseManager)
    {
        var playerId = GetPlayerId(context);
        if (playerId == null) return Results.BadRequest("Missing PlayerId cookie.");

        var form = await context.Request.ReadFormAsync();
        var matchIdStr = form["matchId"].ToString();
        var cardRank = form["cardRank"].ToString();
        var cardSuit = form["cardSuit"].ToString();

        if (!Guid.TryParse(matchIdStr, out var matchId))
            return Results.BadRequest("Invalid match ID.");
        if (string.IsNullOrWhiteSpace(cardRank) || string.IsNullOrWhiteSpace(cardSuit))
            return Results.BadRequest("Card rank and suit are required.");

        var match = matchManager.GetMatch(matchId);
        if (match == null) return Results.NotFound("Match not found.");

        var player = match.Players.FirstOrDefault(p => p.Id == playerId.Value);
        if (player == null) return Results.BadRequest("Player not in match.");

        var card = new Card(cardRank, cardSuit);

        try
        {
            var state = gameEngine.PlayCard(match, playerId.Value, card);

            var cardPlayedEvent = new CardPlayedEvent
            {
                PlayerName = player.Name,
                Card = card
            };
            await eventBroadcaster.BroadcastCardPlayed(match, cardPlayedEvent);
            await BroadcastStatesAsync(match, viewRenderer, broadcaster, sseManager);

            // If trick is complete (4 cards), complete it immediately (no delay — UI concern for Phase 5)
            if (match.CurrentTrick?.IsComplete == true && match.CurrentTrick.Cards.Count == 4)
            {
                await gameEngine.CompleteTrickAndContinue(match);
                await BroadcastStatesAsync(match, viewRenderer, broadcaster, sseManager);
            }

            var html = await viewRenderer.RenderStateUpdateAsync(match, playerId.Value);
            return Results.Content(html, "text/html");
        }
        catch (Exception ex)
        {
            return Results.BadRequest($"Invalid move: {ex.Message}");
        }
    }

    // POST /king/select-trump
    private static async Task<IResult> SelectTrump(
        HttpContext context,
        IKingMatchManager matchManager,
        IKingGameEngine gameEngine,
        IKingEventBroadcaster eventBroadcaster,
        IKingViewRenderer viewRenderer,
        ISseBroadcaster broadcaster,
        ISseConnectionManager sseManager)
    {
        var playerId = GetPlayerId(context);
        if (playerId == null) return Results.BadRequest("Missing PlayerId cookie.");

        var form = await context.Request.ReadFormAsync();
        var matchIdStr = form["matchId"].ToString();
        var trumpSuitStr = form["trumpSuit"].ToString();

        if (!Guid.TryParse(matchIdStr, out var matchId))
            return Results.BadRequest("Invalid match ID.");
        if (!Enum.TryParse<Suit>(trumpSuitStr, out var trumpSuit))
            return Results.BadRequest("Invalid trump suit.");

        var match = matchManager.GetMatch(matchId);
        if (match == null) return Results.NotFound("Match not found.");

        var player = match.Players.FirstOrDefault(p => p.Id == playerId.Value);
        if (player == null) return Results.BadRequest("Player not in match.");

        try
        {
            var state = gameEngine.SelectTrump(match, playerId.Value, trumpSuit);

            var trumpSelectedEvent = new TrumpSelectedEvent
            {
                PlayerName = player.Name,
                TrumpSuit = trumpSuit.ToString()
            };
            await eventBroadcaster.BroadcastTrumpSelected(match, trumpSelectedEvent);
            await BroadcastStatesAsync(match, viewRenderer, broadcaster, sseManager);

            var html = await viewRenderer.RenderStateUpdateAsync(match, playerId.Value);
            return Results.Content(html, "text/html");
        }
        catch (Exception ex)
        {
            return Results.BadRequest($"Invalid trump selection: {ex.Message}");
        }
    }

    // POST /king/end-round
    private static async Task<IResult> EndRound(
        HttpContext context,
        IKingMatchManager matchManager,
        IKingViewRenderer viewRenderer,
        ISseBroadcaster broadcaster,
        ISseConnectionManager sseManager)
    {
        var playerId = GetPlayerId(context);
        if (playerId == null) return Results.BadRequest("Missing PlayerId cookie.");

        var form = await context.Request.ReadFormAsync();
        var matchIdStr = form["matchId"].ToString();

        if (!Guid.TryParse(matchIdStr, out var matchId))
            return Results.BadRequest("Invalid match ID.");

        var match = matchManager.GetMatch(matchId);
        if (match == null) return Results.NotFound("Match not found.");

        if (playerId.Value != match.Players[0].Id)
            return Results.BadRequest("Only the match creator can end the round.");
        if (match.Phase != GamePhase.InProgress)
            return Results.BadRequest("No round is currently in progress.");

        var playerName = match.Players.First(p => p.Id == playerId.Value).Name;

        // Reset match state (same as KingHub_EndRound)
        match.Phase = GamePhase.WaitingForPlayers;
        match.CurrentTrick = null;
        match.CompletedTricks.Clear();
        match.WaitingForTrumpSelection = false;
        match.SelectedTrumpSuit = null;
        match.CurrentPlayerIndex = 0;
        match.CurrentRoundIndex++;

        foreach (var p in match.Players) p.Hand.Clear();

        var endEvent = new GameEventDto
        {
            Type = "RoundEnd",
            DisplayMessage = $"🛑 {MessageFormatter.FormatPlayer(playerName)} ended the round. No scores were calculated.",
            Data = new { InitiatorName = playerName, Cancelled = true }
        };

        await BroadcastEventAsync(match, endEvent, viewRenderer, broadcaster);
        await BroadcastStatesAsync(match, viewRenderer, broadcaster, sseManager);

        var html = await viewRenderer.RenderStateUpdateAsync(match, playerId.Value);
        return Results.Content(html, "text/html");
    }
}
