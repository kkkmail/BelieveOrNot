// Server/King/KingGameEngine_StartNewTrick.cs
namespace BelieveOrNot.Server.King;

public partial class KingGameEngine
{
    private void StartNewTrick(KingMatch match)
    {
        var trickNumber = match.CompletedTricks.Count + 1;
        match.CurrentTrick = new Trick
        {
            TrickNumber = trickNumber
        };
    }
}