// Server/King/IKingGameEngine.cs
namespace BelieveOrNot.Server.King;

public interface IKingGameEngine
{
    KingGameStateDto StartNewRound(KingMatch match);
    KingGameStateDto PlayCard(KingMatch match, Guid playerId, KingCard card);
    KingGameStateDto SelectTrump(KingMatch match, Guid playerId, KingSuit trump);
    KingGameStateDto CreateGameStateDtoForPlayer(KingMatch match, Guid playerId);
    bool IsValidPlay(KingMatch match, KingPlayer player, KingCard card);
}