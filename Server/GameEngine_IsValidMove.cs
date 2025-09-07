// GameEngine_IsValidMove.cs
namespace BelieveOrNot.Server;

public partial class GameEngine
{
    public bool IsValidMove(Match match, Guid playerId, SubmitMoveRequest request)
    {
        if (match.Phase != GamePhase.InProgress) return false;

        var player = match.Players.FirstOrDefault(p => p.Id == playerId);
        if (player == null) return false;

        return request.Action switch
        {
            ActionType.Play => IsValidPlayAction(match, player, request),
            ActionType.Challenge => IsValidChallengeAction(match, player, request),
            _ => false
        };
    }
}
