// Server/King/KingGameEngine_EndRound.cs
namespace BelieveOrNot.Server.King;

public partial class KingGameEngine
{
    private void EndRound(KingMatch match)
    {
        var currentRound = match.CurrentRound!;

        // Calculate scores for this round
        var roundScores = KingScorer.CalculateRoundScores(match, currentRound);

        // Add to player totals
        foreach (var player in match.Players)
        {
            player.Score += roundScores[player.Id];
        }

        // Move to next round
        match.CurrentRoundIndex++;

        if (match.IsGameComplete)
        {
            match.Phase = GamePhase.GameEnd;
        }
        else
        {
            match.Phase = GamePhase.RoundEnd;
        }
    }
}