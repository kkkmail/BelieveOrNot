// BelieveOrNot/GameEngine.cs
namespace BelieveOrNot.Server.BelieveOrNot;

public partial class GameEngine : IGameEngine
{
    private readonly Random _random = new();
    private readonly IMatchManager _matchManager;

    public GameEngine(IMatchManager matchManager)
    {
        _matchManager = matchManager;
    }
}
