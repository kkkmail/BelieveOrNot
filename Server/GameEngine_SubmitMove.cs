// Server/GameEngine_SubmitMove.cs
namespace BelieveOrNot.Server;

public partial class GameEngine
{
    public GameStateDto SubmitMove(Match match, Guid playerId, SubmitMoveRequest request)
    {
        if (!IsValidMove(match, playerId, request))
        {
            throw new InvalidOperationException("Invalid move");
        }

        var player = match.Players.First(p => p.Id == playerId);

        GameEventDto gameEvent = request.Action switch
        {
            ActionType.Play => HandlePlayAction(match, player, request),
            ActionType.Challenge => HandleChallengeAction(match, player, request),
            _ => throw new InvalidOperationException($"Unknown action type: {request.Action}")
        };

        var state = CreateGameStateDto(match, playerId);
        state.Event = gameEvent;
        return state;
    }
}