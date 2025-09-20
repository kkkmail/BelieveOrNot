// BelieveOrNot/GameHub.cs
namespace BelieveOrNot.Server.BelieveOrNot;

public partial class GameHub : Hub
{
    private readonly IGameEngine _gameEngine;
    private readonly IMatchManager _matchManager;

    private readonly ConcurrentDictionary<Guid, Guid> _processedCommands = new();

    // Track connection to player mapping
    private static ConcurrentDictionary<Guid, (Guid MatchId, string ConnectionId)> PlayerToConnection { get; } = new();

    public GameHub(IGameEngine gameEngine, IMatchManager matchManager)
    {
        _gameEngine = gameEngine;
        _matchManager = matchManager;
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
        var playerEntry = PlayerToConnection.FirstOrDefault(kvp => kvp.Value.ConnectionId == Context.ConnectionId);
        if (playerEntry.Key != Guid.Empty)
        {
            PlayerToConnection.TryRemove(playerEntry.Key, out _);
            var playerId = playerEntry.Key;
            var matchId = playerEntry.Value.MatchId;

            var match = _matchManager.GetMatch(matchId);
            if (match != null)
            {
                var player = match.Players.FirstOrDefault(p => p.Id == playerId);
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
