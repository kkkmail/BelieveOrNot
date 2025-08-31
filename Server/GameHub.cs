using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;

public class GameHub : Hub
{
    private readonly IGameEngine _gameEngine;
    private readonly IMatchManager _matchManager;
    private readonly ConcurrentDictionary<Guid, Guid> _processedCommands = new();
    
    public GameHub(IGameEngine gameEngine, IMatchManager matchManager)
    {
        _gameEngine = gameEngine;
        _matchManager = matchManager;
    }
    
    public async Task<GameStateDto> CreateOrJoinMatch(CreateMatchRequest request)
    {
        Match match;
        
        try
        {
            // Try to create new match
            match = _matchManager.CreateMatch(request.PlayerName, request.Settings);
            await Groups.AddToGroupAsync(Context.ConnectionId, $"match:{match.Id}");
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
            }).ToList()
        };
        
        await Clients.Group($"match:{match.Id}").SendAsync("StateUpdate", state, Guid.Empty);
        return state;
    }
    
    public async Task<Match> JoinExistingMatch(Guid matchId, string playerName)
    {
        var match = _matchManager.JoinMatch(matchId, playerName);
        await Groups.AddToGroupAsync(Context.ConnectionId, $"match:{matchId}");
        
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
            }).ToList()
        };
        
        await Clients.Group($"match:{matchId}").SendAsync("StateUpdate", state, Guid.Empty);
        return match;
    }
    
    public async Task StartRound(Guid matchId)
    {
        var match = _matchManager.GetMatch(matchId);
        if (match == null) throw new HubException("Match not found");

        _gameEngine.StartNewRound(match);
        
        // Send personalized state to each player
        foreach (var player in match.Players)
        {
            var playerState = _gameEngine.CreateGameStateDtoForPlayer(match, player.Id);
            await Clients.Group($"match:{matchId}").SendAsync("StateUpdate", playerState, Guid.Empty);
        }
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

        // We need to identify the player making this request
        // For now, we'll assume it's the current turn player
        // In a real implementation, you'd track connection IDs to player IDs
        var currentPlayer = gameMatch.Players[gameMatch.CurrentPlayerIndex];
        
        try
        {
            var state = _gameEngine.SubmitMove(gameMatch, currentPlayer.Id, request);
            _processedCommands.TryAdd(request.ClientCmdId, request.MatchId);

            // Send personalized state to each player in the match
            foreach (var player in gameMatch.Players)
            {
                var playerState = _gameEngine.CreateGameStateDtoForPlayer(gameMatch, player.Id);
                playerState.LastAction = state.LastAction;
                await Clients.Group($"match:{request.MatchId}").SendAsync("StateUpdate", playerState, request.ClientCmdId);
            }
            
            return state;
        }
        catch (Exception ex)
        {
            throw new HubException($"Invalid move: {ex.Message}");
        }
    }
}