// Server/King/KingHub.cs
namespace BelieveOrNot.Server.King;

public partial class KingHub : Hub
{
    private readonly IKingMatchManager _matchManager;
    private readonly IKingGameEngine _gameEngine;
    private readonly IKingEventBroadcaster _eventBroadcaster;
    private static ConcurrentDictionary<Guid, (Guid MatchId, string ConnectionId)> PlayerToConnection { get; } = new();

    public KingHub(IKingMatchManager matchManager, IKingGameEngine gameEngine, IKingEventBroadcaster eventBroadcaster)
    {
        _matchManager = matchManager;
        _gameEngine = gameEngine;
        _eventBroadcaster = eventBroadcaster;
    }
}
