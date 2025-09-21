// Server/King/KingGameEngine_CompleteTrick.cs
namespace BelieveOrNot.Server.King;

public partial class KingGameEngine
{
    private async Task CompleteTrick(KingMatch match)
    {
        var trick = match.CurrentTrick!;
        var winningCard = trick.GetWinningCard(match.SelectedTrumpSuit);

        if (winningCard != null)
        {
            trick.WinnerId = winningCard.PlayerId;

            // Winner leads next trick
            var winnerIndex = match.Players.FindIndex(p => p.Id == winningCard.PlayerId);
            match.CurrentPlayerIndex = winnerIndex;

            // After: var winnerIndex = match.Players.FindIndex(p => p.Id == winningCard.PlayerId);
            match.Players[winnerIndex].TricksWon++;

            // Broadcast trick won event
            var winnerName = match.Players.FirstOrDefault(p => p.Id == winningCard.PlayerId)?.Name;
            if (winnerName != null)
            {
                var trickWonEvent = new TrickWonEvent
                {
                    WinnerName = winnerName,
                    WinningCard = winningCard.Card,
                    TrickNumber = match.CompletedTricks.Count + 1,
                    TrickCards = trick.Cards.ToList()
                };
                await _eventBroadcaster.BroadcastTrickWon(match, trickWonEvent);
            }
        }

        match.CompletedTricks.Add(trick);
        match.CurrentTrick = null;
    }
}
