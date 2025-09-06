// Server/King/KingHub.cs
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace BelieveOrNot.Server.King;

public class KingHub : Hub
{
    private readonly IKingGameEngine _gameEngine;
    private readonly IKingMatchManager _matchManager;

    // Track connection to player mapping
    private static readonly ConcurrentDictionary<string, (Guid MatchId, Guid PlayerId)> _connectionToPlayer = new();

    public KingHub(IKingGameEngine gameEngine, IKingMatchManager matchManager)
    {
        _gameEngine = gameEngine;
        _matchManager = matchManager;
    }

    public async Task<KingGameStateDto> CreateMatch(KingCreateMatchRequest request)
    {
        try
        {
            var match = _matchManager.CreateMatch(request.PlayerName, request.Settings, request.ClientId ?? string.Empty);
            await Groups.AddToGroupAsync(Context.ConnectionId, $"king:{match.Id}");

            // Map this connection to the creator player
            _connectionToPlayer[Context.ConnectionId] = (match.Id, match.Players[0].Id);

            var state = _gameEngine.CreateGameStateDtoForPlayer(match, match.Players[0].Id);

            // Broadcast join event
            var joinEvent = new KingEventDto
            {
                Type = "Join",
                DisplayMessage = $"{request.PlayerName} created the game",
                Data = new { PlayerName = request.PlayerName, IsCreator = true }
            };

            await Clients.Group($"king:{match.Id}").SendAsync("GameEvent", joinEvent);
            await BroadcastPersonalizedStates(match);

            return state;
        }
        catch (Exception ex)
        {
            throw new HubException($"Failed to create match: {ex.Message}");
        }
    }

    public async Task<KingJoinMatchResponse> JoinMatch(KingJoinMatchRequest request)
    {
        if (!Guid.TryParse(request.MatchId, out var matchId))
        {
            return new KingJoinMatchResponse
            {
                Success = false,
                Message = "Invalid match ID format"
            };
        }

        try
        {
            var match = _matchManager.JoinMatch(matchId, request.PlayerName, request.ClientId ?? string.Empty);
            await Groups.AddToGroupAsync(Context.ConnectionId, $"king:{matchId}");

            var joiningPlayer = match.Players.LastOrDefault();
            if (joiningPlayer == null)
            {
                return new KingJoinMatchResponse
                {
                    Success = false,
                    Message = "Failed to find joining player"
                };
            }

            _connectionToPlayer[Context.ConnectionId] = (matchId, joiningPlayer.Id);

            // Broadcast join event
            var joinEvent = new KingEventDto
            {
                Type = "Join",
                DisplayMessage = $"{joiningPlayer.Name} joined the game",
                Data = new { PlayerName = joiningPlayer.Name, IsCreator = false }
            };

            await Clients.Group($"king:{matchId}").SendAsync("GameEvent", joinEvent);
            await BroadcastPersonalizedStates(match);

            return new KingJoinMatchResponse
            {
                Success = true,
                Match = match,
                PlayerId = joiningPlayer.Id,
                AssignedName = joiningPlayer.Name
            };
        }
        catch (Exception ex)
        {
            return new KingJoinMatchResponse
            {
                Success = false,
                Message = ex.Message
            };
        }
    }

    public async Task<KingGameStateDto> StartRound(Guid matchId, Guid playerId)
    {
        var match = _matchManager.GetMatch(matchId);
        if (match == null) throw new HubException("Match not found");

        // Check if requesting player is the creator
        if (playerId != match.Players[0].Id)
        {
            throw new HubException("Only the match creator can start rounds");
        }

        if (match.Players.Count != 4)
        {
            throw new HubException("Need exactly 4 players to start");
        }

        try
        {
            var state = _gameEngine.StartNewRound(match);

            if (state.Event != null)
            {
                await Clients.Group($"king:{matchId}").SendAsync("GameEvent", state.Event);
            }

            await BroadcastPersonalizedStates(match);
            return state;
        }
        catch (Exception ex)
        {
            throw new HubException($"Failed to start round: {ex.Message}");
        }
    }

    public async Task<KingGameStateDto> PlayCard(KingPlayCardRequest request)
    {
        var match = _matchManager.GetMatch(request.MatchId);
        if (match == null) throw new HubException("Match not found");

        try
        {
            var state = _gameEngine.PlayCard(match, request.PlayerId, request.Card);

            if (state.Event != null)
            {
                await Clients.Group($"king:{request.MatchId}").SendAsync("GameEvent", state.Event);
            }

            await BroadcastPersonalizedStates(match);
            return state;
        }
        catch (Exception ex)
        {
            throw new HubException($"Invalid card play: {ex.Message}");
        }
    }

    public async Task<KingGameStateDto> SelectTrump(KingSelectTrumpRequest request)
    {
        var match = _matchManager.GetMatch(request.MatchId);
        if (match == null) throw new HubException("Match not found");

        try
        {
            var state = _gameEngine.SelectTrump(match, request.PlayerId, request.Trump);

            if (state.Event != null)
            {
                await Clients.Group($"king:{request.MatchId}").SendAsync("GameEvent", state.Event);
            }

            await BroadcastPersonalizedStates(match);
            return state;
        }
        catch (Exception ex)
        {
            throw new HubException($"Invalid trump selection: {ex.Message}");
        }
    }

    public async Task<KingReconnectionResponse> ReconnectToMatch(KingReconnectionRequest request)
    {
        if (!Guid.TryParse(request.MatchId, out var matchId))
        {
            return new KingReconnectionResponse
            {
                Success = false,
                Message = "Invalid match ID format"
            };
        }

        var match = _matchManager.GetMatch(matchId);
        if (match == null)
        {
            return new KingReconnectionResponse
            {
                Success = false,
                Message = "Match not found"
            };
        }

        var player = match.Players.FirstOrDefault(p => p.ClientId == request.ClientId);
        if (player == null)
        {
            return new KingReconnectionResponse
            {
                Success = false,
                Message = "Player not found in this match"
            };
        }

        player.IsConnected = true;
        player.LastSeen = DateTime.UtcNow;

        await Groups.AddToGroupAsync(Context.ConnectionId, $"king:{matchId}");
        _connectionToPlayer[Context.ConnectionId] = (matchId, player.Id);

        var reconnectionEvent = new KingEventDto
        {
            Type = "Connection",
            DisplayMessage = $"{player.Name} reconnected",
            Data = new { PlayerName = player.Name, IsConnected = true }
        };

        await Clients.Group($"king:{matchId}").SendAsync("GameEvent", reconnectionEvent);
        await BroadcastPersonalizedStates(match);

        return new KingReconnectionResponse
        {
            Success = true,
            Message = "Successfully reconnected",
            Match = match,
            GameState = _gameEngine.CreateGameStateDtoForPlayer(match, player.Id),
            PlayerId = player.Id
        };
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
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

                    var disconnectionEvent = new KingEventDto
                    {
                        Type = "Connection",
                        DisplayMessage = $"{player.Name} disconnected",
                        Data = new { PlayerName = player.Name, IsConnected = false }
                    };

                    await Clients.Group($"king:{match.Id}").SendAsync("GameEvent", disconnectionEvent);
                    await BroadcastPersonalizedStates(match);
                }
            }
        }

        await base.OnDisconnectedAsync(exception);
    }

    private async Task BroadcastPersonalizedStates(KingMatch match)
    {
        var tasks = _connectionToPlayer
            .Where(kvp => kvp.Value.MatchId == match.Id)
            .Select(async kvp =>
            {
                var connectionId = kvp.Key;
                var playerId = kvp.Value.PlayerId;

                var playerState = _gameEngine.CreateGameStateDtoForPlayer(match, playerId);
                await Clients.Client(connectionId).SendAsync("StateUpdate", playerState);
            });

        await Task.WhenAll(tasks);
    }
}