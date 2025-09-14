// Server/King/KingGameEngine.cs
namespace BelieveOrNot.Server.King;

public partial class KingGameEngine : IKingGameEngine
{
    private readonly Random _random = new();
    private readonly IKingEventBroadcaster _eventBroadcaster;

    public KingGameEngine(IKingEventBroadcaster eventBroadcaster)
    {
        _eventBroadcaster = eventBroadcaster;
    }
}
