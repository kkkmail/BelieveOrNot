// BelieveOrNot/GameEngine_IsValidChallengeAction.cs
namespace BelieveOrNot.Server.BelieveOrNot;

public partial class GameEngine
{
    private bool IsValidChallengeAction(Match match, Player player, SubmitMoveRequest request)
    {
        if (player.Hand.Count == 0) return false;
        if (match.TablePile.Count == 0 || match.AnnouncedRank == null) return false;
        if (!request.ChallengePickIndex.HasValue) return false;

        var pickIndex = request.ChallengePickIndex.Value;
        return pickIndex >= 0 && pickIndex < match.LastPlayCardCount;
    }
}
