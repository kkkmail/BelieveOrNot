// Server/King/KingGameEngine_StartNewRound.cs
namespace BelieveOrNot.Server.King;

public partial class KingGameEngine
{
    public KingGameStateDto StartNewRound(KingMatch match)
    {
        if (match.Players.Count != 4)
        {
            throw new InvalidOperationException("King game requires exactly 4 players");
        }

        if (match.IsGameComplete)
        {
            throw new InvalidOperationException("Game is already complete");
        }

        var currentRound = match.CurrentRound;
        if (currentRound == null)
        {
            throw new InvalidOperationException("No more rounds to play");
        }

        // Deal cards for new round
        DealCards(match);

        // Reset round state
        match.CompletedTricks.Clear();
        match.CurrentTrick = null;
        match.WaitingForTrumpSelection = false;
        match.SelectedTrumpSuit = null;

        // Set round leader (rotates each round)
        match.RoundLeaderIndex = (match.RoundLeaderIndex + 1) % match.Players.Count;
        match.CurrentPlayerIndex = match.RoundLeaderIndex;

        // Check if we need trump selection for collecting phase
        if (currentRound.IsCollectingPhase)
        {
            match.WaitingForTrumpSelection = true;
            // // Current player should be the trump chooser
            // var trumpChooser = match.Players.FirstOrDefault(p => p.Id == currentRound.TrumpChooser);
            // if (trumpChooser != null)
            // {
            //     match.CurrentPlayerIndex = match.Players.IndexOf(trumpChooser);
            // }
        }
        else
        {
            // Start first trick for avoiding rounds
            StartNewTrick(match);
        }

        match.Phase = GamePhase.InProgress;

        return CreateGameStateDto(match);
    }
}
