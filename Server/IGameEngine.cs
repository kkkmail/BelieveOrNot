namespace BelieveOrNot.Server;

public interface IGameEngine
{
    GameStateDto StartNewRound(Match match);
    GameStateDto SubmitMove(Match match, Guid playerId, SubmitMoveRequest request);
    bool IsValidMove(Match match, Guid playerId, SubmitMoveRequest request);
    GameStateDto CreateGameStateDtoForPlayer(Match match, Guid playerId);
}