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

public interface IKingMatchManager
{
    KingMatch? GetMatch(Guid matchId);
    KingMatch CreateMatch(string playerName, KingGameSettings? settings = null, string clientId = "");
    KingMatch JoinMatch(Guid matchId, string playerName, string clientId = "");
    void RemoveMatch(Guid matchId);
    List<KingMatch> GetActiveMatches();
    void AssignPlayerPositions(KingMatch match);
}