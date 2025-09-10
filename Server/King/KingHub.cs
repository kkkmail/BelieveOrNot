// Server/King/KingHub.cs
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
}