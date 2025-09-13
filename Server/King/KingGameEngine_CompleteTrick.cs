// Server/King/KingGameEngine_CompleteTrick.cs
namespace BelieveOrNot.Server.King;

public partial class KingGameEngine
{
    private TrickCompletionResult CompleteTrick(KingMatch match)
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

        // Capture trick details for broadcasting
        var trickResult = new TrickCompletionResult
        {
            WinningCard = winningCard,
            WinnerName = winningCard != null
                ? match.Players.FirstOrDefault(p => p.Id == winningCard.PlayerId)?.Name
                : null,
            TrickCards = trick.Cards.ToList(),
            TrickNumber = match.CompletedTricks.Count
        };

        match.CurrentTrick = null;

        return trickResult;
    }
}
