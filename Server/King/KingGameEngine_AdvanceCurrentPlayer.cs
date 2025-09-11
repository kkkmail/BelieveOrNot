// Server/King/KingGameEngine_AdvanceCurrentPlayer.cs
namespace BelieveOrNot.Server.King;

public partial class KingGameEngine
{
    private void AdvanceCurrentPlayer(KingMatch match)
    {
        match.CurrentPlayerIndex = (match.CurrentPlayerIndex + 1) % match.Players.Count;
    }
}