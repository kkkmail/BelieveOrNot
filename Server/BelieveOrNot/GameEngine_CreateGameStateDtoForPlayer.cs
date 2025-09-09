// BelieveOrNot/GameEngine_CreateGameStateDtoForPlayer.cs
namespace BelieveOrNot.Server.BelieveOrNot;

public partial class GameEngine
{
    public GameStateDto CreateGameStateDtoForPlayer(Match match, Guid playerId)
    {
        return CreateGameStateDto(match, playerId);
    }
}
