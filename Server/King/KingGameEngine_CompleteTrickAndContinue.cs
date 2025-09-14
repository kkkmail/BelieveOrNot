// Server/King/KingGameEngine_CompleteTrickAndContinue.cs
namespace BelieveOrNot.Server.King;

public partial class KingGameEngine
{
    public async Task<KingGameStateDto> CompleteTrickAndContinue(KingMatch match)
    {
        if (match.CurrentTrick?.IsComplete != true)
        {
            return CreateGameStateDto(match);
        }

        // Complete the trick (this will broadcast trick won event)
        await CompleteTrick(match);

        // Check for round end conditions
        if (ShouldEndRound(match))
        {
            await EndRound(match);  // This will broadcast round ended event
        }
        else if (!match.IsRoundComplete)
        {
            StartNewTrick(match);
        }

        return CreateGameStateDto(match);
    }
}
