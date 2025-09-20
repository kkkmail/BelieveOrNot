// King/IKingMatchManager.cs
namespace BelieveOrNot.Server.King;

public interface IKingMatchManager
{
    KingMatch? GetMatch(Guid matchId);
    KingMatch CreateMatch(string playerName, Guid playerId, KingGameSettings? settings = null);
    KingMatch JoinMatch(Guid matchId, string playerName, Guid playerId);
    void RemoveMatch(Guid matchId);
    List<KingMatch> GetActiveMatches();
}
