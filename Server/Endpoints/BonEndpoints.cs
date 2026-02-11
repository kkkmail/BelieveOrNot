// Endpoints/BonEndpoints.cs
using BelieveOrNot.Server.BelieveOrNot;
using BelieveOrNot.Server.Services;
using BelieveOrNot.Server.Shared;
using BelieveOrNot.Server.Sse;
using System.Collections.Concurrent;

namespace BelieveOrNot.Server.Endpoints;

public static class BonEndpoints
{
    private static readonly ConcurrentDictionary<Guid, Guid> ProcessedCommands = new();

    public static void MapBonEndpoints(this WebApplication app)
    {
        app.MapPost("/bon/create", CreateMatch);
        app.MapPost("/bon/join", JoinMatch);
        app.MapPost("/bon/reconnect", ReconnectToMatch);
        app.MapPost("/bon/start-round", StartRound);
        app.MapPost("/bon/play", PlayCards);
        app.MapPost("/bon/challenge", ChallengeMove);
        app.MapPost("/bon/end-round", EndRound);
        app.MapPost("/bon/end-game", EndGame);
        app.MapPost("/bon/message", BroadcastMessage);
        app.MapPost("/bon/check-match", CheckMatch);
    }

    private static Guid? GetPlayerId(HttpContext context)
    {
        if (context.Request.Cookies.TryGetValue("PlayerId", out var value) && Guid.TryParse(value, out var id))
            return id;
        return null;
    }

    private static async Task BroadcastStatesAsync(
        Match match, IBonViewRenderer viewRenderer, ISseBroadcaster broadcaster, ISseConnectionManager sseManager)
    {
        var connections = sseManager.GetConnectionsForMatch(match.Id).ToList();
        var rendered = new Dictionary<Guid, string>();

        foreach (var conn in connections)
        {
            // Use RenderStateUpdateAsync (excludes _SseContainer) to avoid
            // OOB-replacing the live SSE connection element on each broadcast.
            rendered[conn.PlayerId] = await viewRenderer.RenderStateUpdateAsync(match, conn.PlayerId);
        }

        await broadcaster.SendToMatchAsync(match.Id, "state-update",
            playerId => rendered.GetValueOrDefault(playerId, ""));
    }

    private static async Task BroadcastEventAsync(
        Match match, GameEventDto gameEvent, IBonViewRenderer viewRenderer, ISseBroadcaster broadcaster)
    {
        var html = await viewRenderer.RenderEventLogEntryAsync(gameEvent);
        await broadcaster.SendToMatchAsync(match.Id, "game-event", _ => html);
    }

    private static async Task BroadcastMoveEventAsync(
        Match match, GameStateDto state, IBonViewRenderer viewRenderer, ISseBroadcaster broadcaster)
    {
        if (state.Event == null) return;

        var enhancedMessage = state.Event.DisplayMessage;
        enhancedMessage = state.Event.Type switch
        {
            "Challenge" => "⚔️ " + enhancedMessage,
            "CardPlay" => "🃏 " + enhancedMessage,
            "Disposal" => "♠️♥️♦️♣️ " + enhancedMessage,
            "RoundEnd" => "🏁 " + enhancedMessage,
            _ => enhancedMessage
        };

        var broadcastEvent = new GameEventDto
        {
            Type = state.Event.Type,
            DisplayMessage = enhancedMessage,
            Data = state.Event.Data,
            Timestamp = state.Event.Timestamp
        };

        await BroadcastEventAsync(match, broadcastEvent, viewRenderer, broadcaster);
    }

    // POST /bon/create
    private static async Task<IResult> CreateMatch(
        HttpContext context,
        IMatchManager matchManager,
        IBonViewRenderer viewRenderer,
        ISseBroadcaster broadcaster,
        ISseConnectionManager sseManager)
    {
        var playerId = GetPlayerId(context);
        if (playerId == null) return Results.BadRequest("Missing PlayerId cookie.");

        var form = await context.Request.ReadFormAsync();
        var playerName = form["playerName"].ToString();
        if (string.IsNullOrWhiteSpace(playerName)) return Results.BadRequest("Player name is required.");

        var settings = new GameSettings();
        if (Enum.TryParse<DeckSize>(form["deckSize"].ToString(), out var deckSize))
            settings.DeckSize = deckSize;
        if (int.TryParse(form["jokerCount"].ToString(), out var jokerCount))
            settings.JokerCount = jokerCount;
        if (bool.TryParse(form["jokerDisposalEnabled"].ToString(), out var jokerDisposal))
            settings.JokerDisposalEnabled = jokerDisposal;

        try
        {
            var match = matchManager.CreateMatch(playerName, playerId.Value, settings);

            var createEvent = GameEventFactory.CreateJoinEvent(playerName, true);
            await BroadcastEventAsync(match, createEvent, viewRenderer, broadcaster);
            await BroadcastStatesAsync(match, viewRenderer, broadcaster, sseManager);

            var html = await viewRenderer.RenderAllRegionsAsync(match, playerId.Value);
            return Results.Content(html, "text/html");
        }
        catch (Exception ex)
        {
            return Results.BadRequest(ex.Message);
        }
    }

    // POST /bon/join
    private static async Task<IResult> JoinMatch(
        HttpContext context,
        IMatchManager matchManager,
        IBonViewRenderer viewRenderer,
        ISseBroadcaster broadcaster,
        ISseConnectionManager sseManager)
    {
        var playerId = GetPlayerId(context);
        if (playerId == null) return Results.BadRequest("Missing PlayerId cookie.");

        var form = await context.Request.ReadFormAsync();
        var matchIdStr = form["matchId"].ToString();
        var playerName = form["playerName"].ToString();

        if (!Guid.TryParse(matchIdStr, out var matchId))
            return Results.BadRequest("Invalid match ID.");
        if (string.IsNullOrWhiteSpace(playerName))
            return Results.BadRequest("Player name is required.");

        var match = matchManager.GetMatch(matchId);
        if (match == null) return Results.NotFound("Match not found.");
        if (match.Phase != GamePhase.WaitingForPlayers)
            return Results.BadRequest("Game has already started.");

        try
        {
            match = matchManager.JoinMatch(matchId, playerName, playerId.Value);
            var joinedPlayer = match.Players.Last();

            var joinEvent = GameEventFactory.CreateJoinEvent(joinedPlayer.Name, false);
            await BroadcastEventAsync(match, joinEvent, viewRenderer, broadcaster);
            await BroadcastStatesAsync(match, viewRenderer, broadcaster, sseManager);

            var html = await viewRenderer.RenderAllRegionsAsync(match, playerId.Value);
            return Results.Content(html, "text/html");
        }
        catch (InvalidOperationException ex)
        {
            return Results.BadRequest(ex.Message);
        }
    }

    // POST /bon/reconnect
    private static async Task<IResult> ReconnectToMatch(
        HttpContext context,
        IMatchManager matchManager,
        IBonViewRenderer viewRenderer,
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

        var html = await viewRenderer.RenderAllRegionsAsync(match, playerId.Value);
        return Results.Content(html, "text/html");
    }

    // POST /bon/start-round
    private static async Task<IResult> StartRound(
        HttpContext context,
        IMatchManager matchManager,
        IGameEngine gameEngine,
        IBonViewRenderer viewRenderer,
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

        var roundState = gameEngine.StartNewRound(match);

        if (roundState.Event != null)
            await BroadcastEventAsync(match, roundState.Event, viewRenderer, broadcaster);

        await BroadcastStatesAsync(match, viewRenderer, broadcaster, sseManager);

        var html = await viewRenderer.RenderStateUpdateAsync(match, playerId.Value);
        return Results.Content(html, "text/html");
    }

    // POST /bon/play
    private static async Task<IResult> PlayCards(
        HttpContext context,
        IMatchManager matchManager,
        IGameEngine gameEngine,
        IBonViewRenderer viewRenderer,
        ISseBroadcaster broadcaster,
        ISseConnectionManager sseManager)
    {
        var playerId = GetPlayerId(context);
        if (playerId == null) return Results.BadRequest("Missing PlayerId cookie.");

        var form = await context.Request.ReadFormAsync();
        var matchIdStr = form["matchId"].ToString();
        var clientCmdIdStr = form["clientCmdId"].ToString();
        var declaredRank = form["declaredRank"].ToString();
        var cardIndices = form["cardIndices"];

        if (!Guid.TryParse(matchIdStr, out var matchId))
            return Results.BadRequest("Invalid match ID.");
        if (!Guid.TryParse(clientCmdIdStr, out var clientCmdId))
            clientCmdId = Guid.NewGuid();

        var match = matchManager.GetMatch(matchId);
        if (match == null) return Results.NotFound("Match not found.");

        // Idempotency check
        if (ProcessedCommands.ContainsKey(clientCmdId))
        {
            var dupHtml = await viewRenderer.RenderStateUpdateAsync(match, playerId.Value);
            return Results.Content(dupHtml, "text/html");
        }

        // Resolve card indices to actual Card objects from the player's hand
        var player = match.Players.FirstOrDefault(p => p.Id == playerId.Value);
        if (player == null) return Results.BadRequest("Player not in match.");

        var cards = new List<Card>();
        foreach (var indexStr in cardIndices)
        {
            if (int.TryParse(indexStr, out var idx) && idx >= 0 && idx < player.Hand.Count)
                cards.Add(player.Hand[idx]);
            else
                return Results.BadRequest($"Invalid card index: {indexStr}");
        }

        var request = new SubmitMoveRequest
        {
            MatchId = matchId,
            ClientCmdId = clientCmdId,
            PlayerId = playerId.Value,
            Action = ActionType.Play,
            Cards = cards,
            DeclaredRank = declaredRank
        };

        try
        {
            var state = gameEngine.SubmitMove(match, playerId.Value, request);
            ProcessedCommands.TryAdd(clientCmdId, matchId);

            await BroadcastMoveEventAsync(match, state, viewRenderer, broadcaster);
            await BroadcastStatesAsync(match, viewRenderer, broadcaster, sseManager);

            var html = await viewRenderer.RenderStateUpdateAsync(match, playerId.Value);
            return Results.Content(html, "text/html");
        }
        catch (Exception ex)
        {
            return Results.BadRequest($"Invalid move: {ex.Message}");
        }
    }

    // POST /bon/challenge
    private static async Task<IResult> ChallengeMove(
        HttpContext context,
        IMatchManager matchManager,
        IGameEngine gameEngine,
        IBonViewRenderer viewRenderer,
        ISseBroadcaster broadcaster,
        ISseConnectionManager sseManager)
    {
        var playerId = GetPlayerId(context);
        if (playerId == null) return Results.BadRequest("Missing PlayerId cookie.");

        var form = await context.Request.ReadFormAsync();
        var matchIdStr = form["matchId"].ToString();
        var clientCmdIdStr = form["clientCmdId"].ToString();
        var challengePickIndexStr = form["challengePickIndex"].ToString();

        if (!Guid.TryParse(matchIdStr, out var matchId))
            return Results.BadRequest("Invalid match ID.");
        if (!Guid.TryParse(clientCmdIdStr, out var clientCmdId))
            clientCmdId = Guid.NewGuid();
        if (!int.TryParse(challengePickIndexStr, out var challengePickIndex))
            return Results.BadRequest("Invalid challenge pick index.");

        var match = matchManager.GetMatch(matchId);
        if (match == null) return Results.NotFound("Match not found.");

        if (ProcessedCommands.ContainsKey(clientCmdId))
        {
            var dupHtml = await viewRenderer.RenderStateUpdateAsync(match, playerId.Value);
            return Results.Content(dupHtml, "text/html");
        }

        var request = new SubmitMoveRequest
        {
            MatchId = matchId,
            ClientCmdId = clientCmdId,
            PlayerId = playerId.Value,
            Action = ActionType.Challenge,
            ChallengePickIndex = challengePickIndex
        };

        try
        {
            var state = gameEngine.SubmitMove(match, playerId.Value, request);
            ProcessedCommands.TryAdd(clientCmdId, matchId);

            await BroadcastMoveEventAsync(match, state, viewRenderer, broadcaster);
            await BroadcastStatesAsync(match, viewRenderer, broadcaster, sseManager);

            var html = await viewRenderer.RenderStateUpdateAsync(match, playerId.Value);
            return Results.Content(html, "text/html");
        }
        catch (Exception ex)
        {
            return Results.BadRequest($"Invalid move: {ex.Message}");
        }
    }

    // POST /bon/end-round
    private static async Task<IResult> EndRound(
        HttpContext context,
        IMatchManager matchManager,
        IBonViewRenderer viewRenderer,
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

        match.Phase = GamePhase.WaitingForPlayers;
        match.TablePile.Clear();
        match.AnnouncedRank = null;
        match.LastPlayCardCount = 0;
        match.CurrentPlayerIndex = 0;
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

    // POST /bon/end-game
    private static async Task<IResult> EndGame(
        HttpContext context,
        IMatchManager matchManager,
        IBonViewRenderer viewRenderer,
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
            return Results.BadRequest("Only the match creator can end the game.");
        if (match.Phase == GamePhase.InProgress)
            return Results.BadRequest("Cannot end game while round in progress. End the round first.");

        var playerName = match.Players.First(p => p.Id == playerId.Value).Name;

        var sortedPlayers = match.Players
            .OrderByDescending(p => p.Score)
            .ThenBy(p => p.Name)
            .ToList();

        var winners = sortedPlayers
            .Where(p => p.Score == sortedPlayers[0].Score)
            .ToList();

        var finalScores = sortedPlayers.Select((p, index) => new PlayerFinalScore
        {
            PlayerName = p.Name,
            Score = p.Score,
            Position = index + 1
        }).ToList();

        var gameEndEvent = GameEventFactory.CreateGameEndEvent(
            playerName,
            winners.Select(w => w.Name).ToList(),
            winners[0].Score,
            finalScores);

        await BroadcastEventAsync(match, gameEndEvent, viewRenderer, broadcaster);

        var winnerText = winners.Count == 1
            ? $"🏆 {winners[0].Name} wins with {winners[0].Score} points!"
            : $"🏆 Tie game! Winners: {string.Join(", ", winners.Select(w => w.Name))} with {winners[0].Score} points each!";

        var finalHtml = await viewRenderer.RenderFinalResultsAsync(
            winners.Select(w => w.Name).ToList(),
            finalScores.Select(s => $"{s.Position}. {s.PlayerName}: {s.Score} points").ToList(),
            winnerText);
        await broadcaster.SendToMatchAsync(match.Id, "game-ended", _ => finalHtml);

        match.Phase = GamePhase.GameEnd;
        await BroadcastStatesAsync(match, viewRenderer, broadcaster, sseManager);

        var html = await viewRenderer.RenderStateUpdateAsync(match, playerId.Value);
        return Results.Content(html, "text/html");
    }

    // POST /bon/message
    private static async Task<IResult> BroadcastMessage(
        HttpContext context,
        IMatchManager matchManager,
        IBonViewRenderer viewRenderer,
        ISseBroadcaster broadcaster)
    {
        var playerId = GetPlayerId(context);
        if (playerId == null) return Results.BadRequest("Missing PlayerId cookie.");

        var form = await context.Request.ReadFormAsync();
        var matchIdStr = form["matchId"].ToString();
        var message = form["message"].ToString();

        if (!Guid.TryParse(matchIdStr, out var matchId))
            return Results.BadRequest("Invalid match ID.");

        var match = matchManager.GetMatch(matchId);
        if (match == null) return Results.NotFound("Match not found.");

        var player = match.Players.FirstOrDefault(p => p.Id == playerId.Value);
        if (player == null) return Results.BadRequest("Player not in match.");

        var messageEvent = new GameEventDto
        {
            Type = "Message",
            DisplayMessage = message,
            Data = new { SenderName = player.Name }
        };

        await BroadcastEventAsync(match, messageEvent, viewRenderer, broadcaster);
        return Results.Ok();
    }

    // POST /bon/check-match
    private static IResult CheckMatch(MatchCheckRequest request, IMatchManager matchManager)
    {
        if (!Guid.TryParse(request.MatchId, out var matchId))
            return Results.Ok(new { exists = false });

        var match = matchManager.GetMatch(matchId);
        return Results.Ok(new { exists = match != null });
    }
}
