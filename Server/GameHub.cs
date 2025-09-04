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

        // Create simple message event
        var messageEvent = new GameEventDto
        {
            Type = "Message",
            DisplayMessage = message,
            Data = new { SenderName = requestingPlayer.Name }
        };

        await Clients.Group($"match:{matchId}").SendAsync("GameEvent", messageEvent);
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

        // Broadcast reconnection event
        var reconnectionEvent = GameEventFactory.CreateConnectionEvent(player.Name, true);
        await Clients.Group($"match:{matchId}").SendAsync("GameEvent", reconnectionEvent);

        // Send personalized states to all connections
        await BroadcastPersonalizedStates(match);

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
            JokerCount = match.Settings.JokerCount
        };

        // Broadcast game event to all players
        var createEvent = GameEventFactory.CreateJoinEvent(request.PlayerName, true);
        await Clients.Group($"match:{match.Id}").SendAsync("GameEvent", createEvent);

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

            // Broadcast join event to all players
            var joinEvent = GameEventFactory.CreateJoinEvent(joiningPlayer.Name, false);
            await Clients.Group($"match:{matchId}").SendAsync("GameEvent", joinEvent);

            // Send personalized states to all connections
            await BroadcastPersonalizedStates(match);

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

        var endEvent = new GameEventDto
        {
            Type = "RoundEnd",
            DisplayMessage = $"🛑 {MessageFormatter.FormatPlayer(playerName)} ended the round. No scores were calculated.",
            Data = new { InitiatorName = playerName, Cancelled = true }
        };

        await Clients.Group($"match:{matchId}").SendAsync("GameEvent", endEvent);
        await BroadcastPersonalizedStates(match);
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
            finalScores
        );

        await Clients.Group($"match:{matchId}").SendAsync("GameEvent", gameEndEvent);

        // Send final results
        await Clients.Group($"match:{matchId}").SendAsync("GameEnded", new
        {
            Winners = winners.Select(w => w.Name).ToList(),
            FinalScores = finalScores.Select(s => $"{s.Position}. {s.PlayerName}: {s.Score} points").ToList(),
            WinnerText = winners.Count == 1
                ? $"🏆 {winners[0].Name} wins with {winners[0].Score} points!"
                : $"🏆 Tie game! Winners: {string.Join(", ", winners.Select(w => w.Name))} with {winners[0].Score} points each!"
        });

        // Mark game as ended
        match.Phase = GamePhase.GameEnd;
        await BroadcastPersonalizedStates(match);
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

        var roundState = _gameEngine.StartNewRound(match);

        // Broadcast the round start event
        if (roundState.Event != null)
        {
            await Clients.Group($"match:{match.Id}").SendAsync("GameEvent", roundState.Event);
        }

        // Send personalized states to all connections
        await BroadcastPersonalizedStates(match);
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

            // Broadcast the game event if one was generated
            if (state.Event != null)
            {
                // Add appropriate icons based on event type
                var enhancedMessage = state.Event.DisplayMessage;
                if (state.Event.Type == "Challenge")
                {
                    enhancedMessage = "⚔️ " + enhancedMessage;
                }
                else if (state.Event.Type == "CardPlay")
                {
                    enhancedMessage = "🃏 " + enhancedMessage;
                }
                else if (state.Event.Type == "Disposal")
                {
                    enhancedMessage = "♠️♥️♦️♣️ " + enhancedMessage;
                }
                else if (state.Event.Type == "RoundEnd")
                {
                    enhancedMessage = "🏁 " + enhancedMessage;
                }

                // Create enhanced event for broadcast
                var broadcastEvent = new GameEventDto
                {
                    Type = state.Event.Type,
                    DisplayMessage = enhancedMessage,
                    Data = state.Event.Data,
                    Timestamp = state.Event.Timestamp
                };

                await Clients.Group($"match:{gameMatch.Id}").SendAsync("GameEvent", broadcastEvent);
            }

            // Send personalized states to all connections
            await BroadcastPersonalizedStates(gameMatch);

            return state;
        }
        catch (Exception ex)
        {
            throw new HubException($"Invalid move: {ex.Message}");
        }
    }

    private async Task BroadcastPersonalizedStates(Match match)
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

                    // Broadcast disconnection event
                    var disconnectionEvent = GameEventFactory.CreateConnectionEvent(player.Name, false);
                    await Clients.Group($"match:{match.Id}").SendAsync("GameEvent", disconnectionEvent);

                    // Update states for remaining players
                    await BroadcastPersonalizedStates(match);
                }
            }
        }

        await base.OnDisconnectedAsync(exception);
    }
}

// Helper response classes
