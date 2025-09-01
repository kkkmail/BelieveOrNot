using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;

public class GameHub : Hub
{
    private readonly IGameEngine _gameEngine;
    private readonly IMatchManager _matchManager;

    private readonly ConcurrentDictionary<Guid, Guid> _processedCommands = new();

    // Track connection to player mapping
    private static readonly ConcurrentDictionary<string, (Guid MatchId, Guid PlayerId)> _connectionToPlayer = new();

    public GameHub(IGameEngine gameEngine, IMatchManager matchManager)
    {
        _gameEngine = gameEngine;
        _matchManager = matchManager;
    }

    // Method to broadcast messages to all players in a match
    public async Task BroadcastMessage(Guid matchId, string message)
    {
        var match = _matchManager.GetMatch(matchId);
        if (match == null) throw new HubException("Match not found");

        // Find the requesting player
        var connectionInfo = _connectionToPlayer.FirstOrDefault(kvp => kvp.Key == Context.ConnectionId);
        if (connectionInfo.Key == null) throw new HubException("Player not found");

        var requestingPlayer = match.Players.FirstOrDefault(p => p.Id == connectionInfo.Value.PlayerId);
        if (requestingPlayer == null) throw new HubException("Player not in match");

        // Broadcast the message to all players in the match
        var timestampedMessage = $"{DateTime.Now:HH:mm:ss}: {message}";
        await Clients.Group($"match:{matchId}").SendAsync("MessageBroadcast", timestampedMessage, requestingPlayer.Name);
    }

    public async Task<GameStateDto> CreateOrJoinMatch(CreateMatchRequest request)
    {
        Match match;

        try
        {
            // Try to create new match
            match = _matchManager.CreateMatch(request.PlayerName, request.Settings);
            await Groups.AddToGroupAsync(Context.ConnectionId, $"match:{match.Id}");

            // Map this connection to the creator player
            _connectionToPlayer[Context.ConnectionId] = (match.Id, match.Players[0].Id);
        }
        catch
        {
            throw new HubException("Failed to create match");
        }

        var state = new GameStateDto
        {
            MatchId = match.Id,
            Phase = match.Phase,
            Players = match.Players.Select(p => new PlayerStateDto
            {
                Id = p.Id,
                Name = p.Name,
                HandCount = p.Hand.Count,
                Score = p.Score,
                IsConnected = p.IsConnected
            }).ToList(),
            CreatorPlayerId = match.Players[0].Id,
            DeckSize = match.Settings.DeckSize,
            JokerCount = match.Settings.JokerCount,
            LastAction = $"🎮 {request.PlayerName} created the game!"
        };

        // FIXED: Broadcast game message to all players
        var createMessage = $"🎮 {request.PlayerName} created the game!";
        await Clients.Group($"match:{match.Id}").SendAsync("MessageBroadcast", $"{DateTime.Now:HH:mm:ss}: {createMessage}", "System");

        // Also send state update
        await Clients.Group($"match:{match.Id}").SendAsync("StateUpdate", state, Guid.Empty);
        return state;
    }

    public async Task<Match> JoinExistingMatch(Guid matchId, string playerName)
    {
        var match = _matchManager.JoinMatch(matchId, playerName);
        await Groups.AddToGroupAsync(Context.ConnectionId, $"match:{matchId}");

        // Map this connection to the joining player
        var joiningPlayer = match.Players.Last();
        _connectionToPlayer[Context.ConnectionId] = (matchId, joiningPlayer.Id);

        // FIXED: Broadcast join message to all players
        var joinMessage = $"👋 {joiningPlayer.Name} joined the game!";
        await Clients.Group($"match:{matchId}").SendAsync("MessageBroadcast", $"{DateTime.Now:HH:mm:ss}: {joinMessage}", "System");

        // Send personalized states to all connections (without LastAction since we broadcasted separately)
        await BroadcastPersonalizedStates(match, null);

        return match;
    }

    public async Task StartRound(Guid matchId, Guid requestingPlayerId)
    {
        var match = _matchManager.GetMatch(matchId);
        if (match == null) throw new HubException("Match not found");

        // Check if requesting player is the creator (first player)
        if (requestingPlayerId != match.Players[0].Id)
        {
            throw new HubException("Only the match creator can start the round");
        }

        var playerName = match.Players.First(p => p.Id == requestingPlayerId).Name;
        var roundState = _gameEngine.StartNewRound(match);

        // FIXED: Extract and broadcast the round start message
        var roundStartMessage = roundState.LastAction; // This contains the full round start message with disposal events
        if (!string.IsNullOrEmpty(roundStartMessage))
        {
            await Clients.Group($"match:{match.Id}").SendAsync("MessageBroadcast", $"{DateTime.Now:HH:mm:ss}: {roundStartMessage}", "System");
        }

        // Send personalized states to all connections (without LastAction since we broadcasted separately)
        await BroadcastPersonalizedStates(match, null);
    }

    public async Task<GameStateDto> SubmitMove(SubmitMoveRequest request)
    {
        // Check for duplicate command (idempotency)
        if (_processedCommands.ContainsKey(request.ClientCmdId))
        {
            var match = _matchManager.GetMatch(request.MatchId);
            if (match != null)
            {
                return new GameStateDto { MatchId = request.MatchId, Phase = match.Phase };
            }
        }

        var gameMatch = _matchManager.GetMatch(request.MatchId);
        if (gameMatch == null) throw new HubException("Match not found");

        try
        {
            // Use the player ID from the request
            var state = _gameEngine.SubmitMove(gameMatch, request.PlayerId, request);
            _processedCommands.TryAdd(request.ClientCmdId, request.MatchId);

            // FIXED: Extract and broadcast the action message
            var actionMessage = state.LastAction;
            if (!string.IsNullOrEmpty(actionMessage))
            {
                // Add appropriate icons based on message content
                var enhancedMessage = actionMessage;
                if (actionMessage.Contains("challenges"))
                {
                    enhancedMessage = "⚔️ " + actionMessage;
                }
                else if (actionMessage.Contains("played") && actionMessage.Contains("card"))
                {
                    enhancedMessage = "🃏 " + actionMessage;
                }
                else if (actionMessage.Contains("disposed 4 of a kind"))
                {
                    enhancedMessage = "♠️♥️♦️♣️ " + actionMessage;
                }
                else if (actionMessage.Contains("Round") && actionMessage.Contains("ended"))
                {
                    enhancedMessage = "🏁 " + actionMessage;
                }
                else if (actionMessage.Contains("NO CARDS LEFT"))
                {
                    enhancedMessage = "🎯 " + actionMessage;
                }

                await Clients.Group($"match:{gameMatch.Id}").SendAsync("MessageBroadcast", $"{DateTime.Now:HH:mm:ss}: {enhancedMessage}", "System");
            }

            // Send personalized states to all connections (without LastAction since we broadcasted separately)
            await BroadcastPersonalizedStates(gameMatch, null);

            return state;
        }
        catch (Exception ex)
        {
            throw new HubException($"Invalid move: {ex.Message}");
        }
    }

    private async Task BroadcastPersonalizedStates(Match match, string? lastAction = null)
    {
        // Send personalized state to each connection based on their mapped player
        var tasks = _connectionToPlayer
            .Where(kvp => kvp.Value.MatchId == match.Id)
            .Select(async kvp =>
            {
                var connectionId = kvp.Key;
                var playerId = kvp.Value.PlayerId;

                var playerState = _gameEngine.CreateGameStateDtoForPlayer(match, playerId);
                playerState.CreatorPlayerId = match.Players[0].Id;
                playerState.DeckSize = match.Settings.DeckSize;
                playerState.JokerCount = match.Settings.JokerCount;
                if (lastAction != null)
                {
                    playerState.LastAction = lastAction;
                }

                await Clients.Client(connectionId).SendAsync("StateUpdate", playerState, Guid.Empty);
            });

        await Task.WhenAll(tasks);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _connectionToPlayer.TryRemove(Context.ConnectionId, out _);
        await base.OnDisconnectedAsync(exception);
    }
}