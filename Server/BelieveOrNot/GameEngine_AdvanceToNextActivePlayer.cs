// BelieveOrNot/GameEngine_AdvanceToNextActivePlayer.cs
namespace BelieveOrNot.Server.BelieveOrNot;

public partial class GameEngine
{
    private void AdvanceToNextActivePlayer(Match match)
    {
        int attempts = 0;
        int maxAttempts = match.Players.Count;

        do
        {
            match.CurrentPlayerIndex = (match.CurrentPlayerIndex + 1) % match.Players.Count;
            attempts++;

            if (attempts >= maxAttempts)
            {
                Console.WriteLine("WARNING: All players have 0 cards but round hasn't ended");
                break;
            }
        } while (match.Players[match.CurrentPlayerIndex].Hand.Count == 0);
    }
}
