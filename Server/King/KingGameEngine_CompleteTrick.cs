// Server/King/KingGameEngine_CompleteTrick.cs
namespace BelieveOrNot.Server.King;

public partial class KingGameEngine
{
    private void CompleteTrick(KingMatch match)
    {
        var trick = match.CurrentTrick!;
        var winningCard = trick.GetWinningCard(match.SelectedTrumpSuit);

        if (winningCard != null)
        {
            trick.WinnerId = winningCard.PlayerId;

            // Winner leads next trick
            var winnerIndex = match.Players.FindIndex(p => p.Id == winningCard.PlayerId);
            match.CurrentPlayerIndex = winnerIndex;
        }

        match.CompletedTricks.Add(trick);
        match.CurrentTrick = null;
    }
}