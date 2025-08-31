public interface IMatchManager
{
    Match? GetMatch(Guid matchId);
    Match CreateMatch(string playerName, GameSettings? settings = null);
    Match JoinMatch(Guid matchId, string playerName);
    void RemoveMatch(Guid matchId);
    List<Match> GetActiveMatches();
}