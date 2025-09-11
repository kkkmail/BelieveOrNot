// Server/King/KingGameEngine_GetInvalidMoveReason.cs
namespace BelieveOrNot.Server.King;

public partial class KingGameEngine
{
    private string GetInvalidMoveReason(KingMatch match, Player player, Card card)
    {
        if (match.Phase != GamePhase.InProgress)
            return "Game not in progress";

        if (match.CurrentPlayer.Id != player.Id)
            return "Not your turn";

        if (!player.Hand.Contains(card))
            return "You don't have this card";

        var currentRound = match.CurrentRound;
        if (currentRound == null)
            return "No active round";

        var trick = match.CurrentTrick;
        if (trick == null)
            return "No active trick";

        // Additional validation logic would go here
        return "Invalid move";
    }
}