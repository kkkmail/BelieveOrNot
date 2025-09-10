// Server/King/KingGameEngine_SelectTrump.cs
namespace BelieveOrNot.Server.King;

public partial class KingGameEngine
{
    public KingGameStateDto SelectTrump(KingMatch match, Guid playerId, Suit trumpSuit)
    {
        var player = match.Players.FirstOrDefault(p => p.Id == playerId);
        if (player == null)
        {
            throw new InvalidOperationException("Player not found");
        }

        if (!KingMoveValidator.IsValidTrumpSelection(match, player, trumpSuit))
        {
            throw new InvalidOperationException("Invalid trump selection");
        }

        match.SelectedTrumpSuit = trumpSuit;
        match.CurrentRound!.TrumpSuit = trumpSuit;
        match.WaitingForTrumpSelection = false;

        // Start first trick
        StartNewTrick(match);

        return CreateGameStateDto(match);
    }
}