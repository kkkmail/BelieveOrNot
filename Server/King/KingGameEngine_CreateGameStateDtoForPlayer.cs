// Server/King/KingGameEngine_CreateGameStateDtoForPlayer.cs
namespace BelieveOrNot.Server.King;

public partial class KingGameEngine
{
    public KingGameStateDto CreateGameStateDtoForPlayer(KingMatch match, Guid playerId)
    {
        var state = CreateGameStateDto(match);

        var player = match.Players.FirstOrDefault(p => p.Id == playerId);
        if (player != null)
        {
            state.YourHand = player.Hand.ToList();
            state.TrumSelectionCards = player.TrumSelectionCards?.ToList();
        }

        return state;
    }
}
