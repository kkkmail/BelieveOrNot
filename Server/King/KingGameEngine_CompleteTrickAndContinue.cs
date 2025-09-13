// Server/King/KingGameEngine_CompleteTrickAndContinue.cs
namespace BelieveOrNot.Server.King;

public partial class KingGameEngine
{
    public (KingGameStateDto gameState, TrickCompletionResult trickResult) CompleteTrickAndContinue(KingMatch match)
    {
        if (match.CurrentTrick?.IsComplete != true)
        {
            return (CreateGameStateDto(match), null);
        }

        // Complete the trick and get results
        var trickResult = CompleteTrick(match);

        // Check for round end conditions
        if (ShouldEndRound(match))
        {
            EndRound(match);
        }
        else if (!match.IsRoundComplete)
        {
            StartNewTrick(match);
        }

        return (CreateGameStateDto(match), trickResult);
    }
}
