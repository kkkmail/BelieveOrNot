namespace BelieveOrNot.Server.King;

public interface IKingMatchManager
{
    KingMatch? GetMatch(Guid matchId);
    KingMatch CreateMatch(string playerName, KingGameSettings? settings = null, string clientId = "");
    KingMatch JoinMatch(Guid matchId, string playerName, string clientId = "");
    void RemoveMatch(Guid matchId);
    List<KingMatch> GetActiveMatches();
    void AssignPlayerPositions(KingMatch match);
}