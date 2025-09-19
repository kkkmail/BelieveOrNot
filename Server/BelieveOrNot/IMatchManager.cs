// BelieveOrNot/IMatchManager.cs
namespace BelieveOrNot.Server.BelieveOrNot;

public interface IMatchManager
{
    Match? GetMatch(Guid matchId);
    Match CreateMatch(string playerName, Guid playerId, GameSettings? settings = null);
    Match JoinMatch(Guid matchId, string playerName, Guid playerId);
    void RemoveMatch(Guid matchId);
    List<Match> GetActiveMatches();
    void ShufflePlayersForNewRound(Match match);
}
