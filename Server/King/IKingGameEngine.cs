// Server/King/IKingGameEngine.cs
namespace BelieveOrNot.Server.King;

public interface IKingGameEngine
{
    KingGameStateDto StartNewRound(KingMatch match);
    KingGameStateDto PlayCard(KingMatch match, Guid playerId, Card card);
    KingGameStateDto SelectTrump(KingMatch match, Guid playerId, Suit trumpSuit);
    KingGameStateDto CreateGameStateDto(KingMatch match);
    KingGameStateDto CreateGameStateDtoForPlayer(KingMatch match, Guid playerId);
    Task<KingGameStateDto> CompleteTrickAndContinue(KingMatch match);
}
