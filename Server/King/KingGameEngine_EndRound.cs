// Server/King/KingGameEngine_EndRound.cs
namespace BelieveOrNot.Server.King;

public partial class KingGameEngine
{
    private async Task EndRound(KingMatch match)
    {
        var currentRound = match.CurrentRound!;

        // Calculate scores for this round
        var roundScores = KingScorer.CalculateRoundScores(match, currentRound);

        // Determine why the round ended
        var endReason = "All tricks completed";
        var tricksCompleted = match.CompletedTricks.Count;
        var wasEarlyTermination = false;

        if (currentRound.CanEndEarly && KingScorer.ShouldEndRoundEarly(match, currentRound))
        {
            wasEarlyTermination = true;
            endReason = currentRound.RoundType switch
            {
                GameRoundType.AvoidHearts => "All Hearts cards taken",
                GameRoundType.AvoidBoys => "All Jacks and Kings taken",
                GameRoundType.AvoidQueens => "All Queens taken",
                GameRoundType.AvoidKingOfHearts => "King of Hearts taken",
                GameRoundType.AvoidTricks => "All tricks taken",
                _ => "Early termination condition met"
            };
        }

        // Broadcast round ended event
        var roundEndedEvent = new RoundEndedEvent
        {
            Round = currentRound,
            RoundScores = roundScores,
            WasEarlyTermination = wasEarlyTermination,
            EndReason = endReason,
            TricksCompleted = tricksCompleted
        };
        await _eventBroadcaster.BroadcastRoundEnded(match, roundEndedEvent);

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
