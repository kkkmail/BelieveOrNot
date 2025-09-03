// Server/GameHub.cs
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

    // Reconnection method
    public async Task<ReconnectionResponse> ReconnectToMatch(string matchIdString, string clientId)
    {
        if (!Guid.TryParse(matchIdString, out var matchId))
        {
            return new ReconnectionResponse 
            { 
                Success = false, 
                Message = "Invalid match ID format." 
            };
        }

        var match = _matchManager.GetMatch(matchId);
        if (match == null)
        {
            return new ReconnectionResponse 
            { 
                Success = false, 
                Message = "The game you were trying to rejoin no longer exists or has ended." 
            };
        }

        // Find player by client ID
        var player = match.Players.FirstOrDefault(p => p.ClientId == clientId);
        if (player == null)
        {
            // Check if game has started and new players can't join
            if (match.Phase != GamePhase.WaitingForPlayers)
            {
                return new ReconnectionResponse 
                { 
                    Success = false, 
                    Message = "This game has already started and new players cannot join." 
                };
            }
            
            return new ReconnectionResponse 
            { 
                Success = false, 
                Message = "You were not found in this game. You can try joining with your name instead." 
            };
        }

        // Mark player as connected and update last seen
        player.IsConnected = true;
        player.LastSeen = DateTime.UtcNow;

        // Add to SignalR group
        await Groups.AddToGroupAsync(Context.ConnectionId, $"match:{matchId}");
        
        // Map connection to player
        _connectionToPlayer[Context.ConnectionId] = (matchId, player.Id);

        // Broadcast reconnection message using structured formatting
        var reconnectionMessage = MessageFormatter.ConnectionEvent(player.Name, true);
        await Clients.Group($"match:{matchId}").SendAsync("MessageBroadcast", $"{DateTime.Now:HH:mm:ss}: {reconnectionMessage}", "System");

        // Send personalized states to all connections
        await BroadcastPersonalizedStates(match, null);

        return new ReconnectionResponse
        {
            Success = true,
            Message = "Successfully reconnected!",
            Match = match,
            GameState = _gameEngine.CreateGameStateDtoForPlayer(match, player.Id),
            PlayerId = player.Id
        };
    }

    public async Task<GameStateDto> CreateOrJoinMatch(CreateMatchRequest request)
    {
        Match match;

        try
        {
            // Try to create new match
            match = _matchManager.CreateMatch(request.PlayerName, request.Settings, request.ClientId ?? string.Empty);
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
            LastAction = MessageFormatter.JoinEvent(request.PlayerName, true)
        };

        // Broadcast game message to all players using structured formatting
        var createMessage = MessageFormatter.JoinEvent(request.PlayerName, true);
        await Clients.Group($"match:{match.Id}").SendAsync("MessageBroadcast", $"{DateTime.Now:HH:mm:ss}: {createMessage}", "System");

        // Also send state update
        await Clients.Group($"match:{match.Id}").SendAsync("StateUpdate", state, Guid.Empty);
        return state;
    }

    public async Task<JoinMatchResponse> JoinExistingMatch(string matchIdString, string playerName, string clientId = "")
    {
        if (!Guid.TryParse(matchIdString, out var matchId))
        {
            throw new HubException("Invalid match ID format.");
        }

        var match = _matchManager.GetMatch(matchId);
        if (match == null)
        {
            throw new HubException("The game you're trying to join no longer exists or has ended.");
        }

        if (match.Phase != GamePhase.WaitingForPlayers)
        {
            throw new HubException("This game has already started and new players cannot join.");
        }

        try
        {
            match = _matchManager.JoinMatch(matchId, playerName, clientId);
            await Groups.AddToGroupAsync(Context.ConnectionId, $"match:{matchId}");

            // Map this connection to the joining player
            var joiningPlayer = match.Players.Last();
            _connectionToPlayer[Context.ConnectionId] = (matchId, joiningPlayer.Id);

            // Broadcast join message to all players using structured formatting
            var joinMessage = MessageFormatter.JoinEvent(joiningPlayer.Name, false);
            await Clients.Group($"match:{matchId}").SendAsync("MessageBroadcast", $"{DateTime.Now:HH:mm:ss}: {joinMessage}", "System");

            // Send personalized states to all connections
            await BroadcastPersonalizedStates(match, null);

            return new JoinMatchResponse
            {
                Success = true,
                Match = match,
                PlayerId = joiningPlayer.Id,
                AssignedName = joiningPlayer.Name
            };
        }
        catch (InvalidOperationException ex)
        {
            throw new HubException(ex.Message);
        }
    }

    // End round method (creator only)
    public async Task EndRound(Guid matchId, Guid requestingPlayerId)
    {
        var match = _matchManager.GetMatch(matchId);
        if (match == null) throw new HubException("Match not found");

        // Check if requesting player is the creator
        if (requestingPlayerId != match.Players[0].Id)
        {
            throw new HubException("Only the match creator can end the round");
        }

        if (match.Phase != GamePhase.InProgress)
        {
            throw new HubException("No round is currently in progress");
        }

        var playerName = match.Players.First(p => p.Id == requestingPlayerId).Name;

        // Reset match state
        match.Phase = GamePhase.WaitingForPlayers;
        match.TablePile.Clear();
        match.AnnouncedRank = null;
        match.LastPlayCardCount = 0;
        match.CurrentPlayerIndex = 0;

        // Clear all hands
        foreach (var player in match.Players)
        {
            player.Hand.Clear();
        }

        var endMessage = $"🛑 {MessageFormatter.FormatPlayer(playerName)} ended the round. No scores were calculated.";
        await Clients.Group($"match:{matchId}").SendAsync("MessageBroadcast", $"{DateTime.Now:HH:mm:ss}: {endMessage}", "System");

        await BroadcastPersonalizedStates(match, null);
    }

    // End game method (creator only)
    public async Task EndGame(Guid matchId, Guid requestingPlayerId)
    {
        var match = _matchManager.GetMatch(matchId);
        if (match == null) throw new HubException("Match not found");

        // Check if requesting player is the creator
        if (requestingPlayerId != match.Players[0].Id)
        {
            throw new HubException("Only the match creator can end the game");
        }

        if (match.Phase == GamePhase.InProgress)
        {
            throw new HubException("Cannot end game while a round is in progress. End the round first.");
        }

        var playerName = match.Players.First(p => p.Id == requestingPlayerId).Name;

        // Calculate final results
        var sortedPlayers = match.Players
            .OrderByDescending(p => p.Score)
            .ThenBy(p => p.Name)
            .ToList();

        var winners = sortedPlayers
            .Where(p => p.Score == sortedPlayers[0].Score)
            .ToList();

        var resultsLines = sortedPlayers.Select((p, index) => 
            $"{index + 1}. {p.Name}: {p.Score} points").ToList();

        var endMessage = MessageFormatter.GameEnd(playerName, winners.Select(w => w.Name).ToList(), winners[0].Score);
        await Clients.Group($"match:{matchId}").SendAsync("MessageBroadcast", $"{DateTime.Now:HH:mm:ss}: {endMessage}", "System");

        // Send final results
        await Clients.Group($"match:{matchId}").SendAsync("GameEnded", new
        {
            Winners = winners.Select(w => w.Name).ToList(),
            FinalScores = resultsLines,
            WinnerText = winners.Count == 1 
                ? $"🏆 {winners[0].Name} wins with {winners[0].Score} points!"
                : $"🏆 Tie game! Winners: {string.Join(", ", winners.Select(w => w.Name))} with {winners[0].Score} points each!"
        });

        // Mark game as ended
        match.Phase = GamePhase.GameEnd;
        await BroadcastPersonalizedStates(match, null);
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

        // Extract and broadcast the round start message
        var roundStartMessage = roundState.LastAction;
        if (!string.IsNullOrEmpty(roundStartMessage))
        {
            await Clients.Group($"match:{match.Id}").SendAsync("MessageBroadcast", $"{DateTime.Now:HH:mm:ss}: {roundStartMessage}", "System");
        }

        // Send personalized states to all connections
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

            // Extract and broadcast the action message
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

            // Send personalized states to all connections
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

    public override async Task OnConnectedAsync()
    {
        Console.WriteLine($"Client connected: {Context.ConnectionId}");
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        Console.WriteLine($"Client disconnected: {Context.ConnectionId}");
        
        // Find the player associated with this connection
        if (_connectionToPlayer.TryRemove(Context.ConnectionId, out var connectionInfo))
        {
            var match = _matchManager.GetMatch(connectionInfo.MatchId);
            if (match != null)
            {
                var player = match.Players.FirstOrDefault(p => p.Id == connectionInfo.PlayerId);
                if (player != null)
                {
                    player.IsConnected = false;
                    player.LastSeen = DateTime.UtcNow;
                    
                    // Broadcast disconnection message using structured formatting
                    var disconnectionMessage = MessageFormatter.ConnectionEvent(player.Name, false);
                    await Clients.Group($"match:{match.Id}").SendAsync("MessageBroadcast", $"{DateTime.Now:HH:mm:ss}: {disconnectionMessage}", "System");
                    
                    // Update states for remaining players
                    await BroadcastPersonalizedStates(match, null);
                }
            }
        }
        
        await base.OnDisconnectedAsync(exception);
    }
}

// Helper response classes
public class JoinMatchResponse
{
    public bool Success { get; set; }
    public Match? Match { get; set; }
    public Guid? PlayerId { get; set; }
    public string AssignedName { get; set; } = string.Empty;
}