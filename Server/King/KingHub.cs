// King/KingHub.cs
namespace BelieveOrNot.Server.King;

public partial class KingHub : Hub
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

    public override async Task OnConnectedAsync()
    {
        Console.WriteLine($"King client connected: {Context.ConnectionId}");
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        Console.WriteLine($"King client disconnected: {Context.ConnectionId}");

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

                    await BroadcastPersonalizedStates(match);
                }
            }
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task<KingGameStateDto> CreateOrJoinMatch(KingCreateMatchRequest request)
    {
        try
        {
            var match = _matchManager.CreateMatch(request.PlayerName, request.Settings, request.ClientId ?? string.Empty);
            await Groups.AddToGroupAsync(Context.ConnectionId, $"kingmatch:{match.Id}");

            _connectionToPlayer[Context.ConnectionId] = (match.Id, match.Players[0].Id);

            var state = _gameEngine.CreateGameStateDto(match);
            await Clients.Group($"kingmatch:{match.Id}").SendAsync("StateUpdate", state);

            return state;
        }
        catch
        {
            throw new HubException("Failed to create King match");
        }
    }

    public async Task<KingJoinMatchResponse> JoinExistingMatch(string matchIdString, string playerName, string clientId = "")
    {
        if (!Guid.TryParse(matchIdString, out var matchId))
        {
            throw new HubException("Invalid match ID format.");
        }

        var match = _matchManager.GetMatch(matchId);
        if (match == null)
        {
            throw new HubException("The King game you're trying to join no longer exists or has ended.");
        }

        if (match.Phase != GamePhase.WaitingForPlayers)
        {
            throw new HubException("This King game has already started and new players cannot join.");
        }

        if (match.Players.Count >= 4)
        {
            throw new HubException("This King game is full (4 players maximum).");
        }

        try
        {
            match = _matchManager.JoinMatch(matchId, playerName, clientId);
            await Groups.AddToGroupAsync(Context.ConnectionId, $"kingmatch:{matchId}");

            var joiningPlayer = match.Players.Last();
            _connectionToPlayer[Context.ConnectionId] = (matchId, joiningPlayer.Id);

            await BroadcastPersonalizedStates(match);

            return new KingJoinMatchResponse
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

    public async Task<KingGameStateDto> StartRound(KingStartRoundRequest request)
    {
        var match = _matchManager.GetMatch(request.MatchId);
        if (match == null) throw new HubException("King match not found");

        // Check if requesting player is the creator (first player)
        if (request.PlayerId != match.Players[0].Id)
        {
            throw new HubException("Only the match creator can start the round");
        }

        if (match.Players.Count != 4)
        {
            throw new HubException("King game requires exactly 4 players");
        }

        try
        {
            var state = _gameEngine.StartNewRound(match);
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
        if (match == null) throw new HubException("King match not found");

        try
        {
            var state = _gameEngine.PlayCard(match, request.PlayerId, request.Card);
            await BroadcastPersonalizedStates(match);

            // Check if trick was just completed (4 cards and marked complete)
            if (match.CurrentTrick?.IsComplete == true && match.CurrentTrick.Cards.Count == 4)
            {
                // // Schedule trick completion after delay
                // _ = Task.Delay(2000).ContinueWith(async _ =>
                // {
                //     // Complete the trick and broadcast the updated state
                //     _gameEngine.CompleteTrickAndContinue(match);
                //     await BroadcastPersonalizedStates(match);
                // });

                await Task.Delay(2000);
                var comletedState = _gameEngine.CompleteTrickAndContinue(match);
                await BroadcastPersonalizedStates(match);
                return comletedState;
            }

            return state;
        }
        catch (Exception ex)
        {
            throw new HubException($"Failed to play card: {ex.Message}");
        }
    }

    public async Task<KingGameStateDto> SelectTrump(KingSelectTrumpRequest request)
    {
        var match = _matchManager.GetMatch(request.MatchId);
        if (match == null) throw new HubException("King match not found");

        try
        {
            var state = _gameEngine.SelectTrump(match, request.PlayerId, request.TrumpSuit);
            await BroadcastPersonalizedStates(match);
            return state;
        }
        catch (Exception ex)
        {
            throw new HubException($"Invalid trump selection: {ex.Message}");
        }
    }

    public async Task<KingReconnectionResponse> ReconnectToMatch(string matchIdString, string clientId)
    {
        if (!Guid.TryParse(matchIdString, out var matchId))
        {
            return new KingReconnectionResponse
            {
                Success = false,
                Message = "Invalid match ID format."
            };
        }

        var match = _matchManager.GetMatch(matchId);
        if (match == null)
        {
            return new KingReconnectionResponse
            {
                Success = false,
                Message = "The King game you were trying to rejoin no longer exists or has ended."
            };
        }

        var player = match.Players.FirstOrDefault(p => p.ClientId == clientId);
        if (player == null)
        {
            if (match.Phase != GamePhase.WaitingForPlayers)
            {
                return new KingReconnectionResponse
                {
                    Success = false,
                    Message = "This King game has already started and new players cannot join."
                };
            }

            return new KingReconnectionResponse
            {
                Success = false,
                Message = "You were not found in this King game."
            };
        }

        player.IsConnected = true;
        player.LastSeen = DateTime.UtcNow;

        await Groups.AddToGroupAsync(Context.ConnectionId, $"kingmatch:{matchId}");
        _connectionToPlayer[Context.ConnectionId] = (matchId, player.Id);

        await BroadcastPersonalizedStates(match);

        return new KingReconnectionResponse
        {
            Success = true,
            Message = "Successfully reconnected to King game!",
            Match = match,
            GameState = _gameEngine.CreateGameStateDtoForPlayer(match, player.Id),
            PlayerId = player.Id
        };
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
