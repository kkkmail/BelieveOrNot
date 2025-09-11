// Server/King/KingGameEngine_ShouldEndRound.cs
namespace BelieveOrNot.Server.King;

public partial class KingGameEngine
{
    private bool ShouldEndRound(KingMatch match)
    {
        var currentRound = match.CurrentRound!;

        // Check early termination conditions
        if (KingScorer.ShouldEndRoundEarly(match, currentRound))
        {
            return true;
        }

        // Round ends when all 8 tricks are complete
        return match.IsRoundComplete;
    }
}