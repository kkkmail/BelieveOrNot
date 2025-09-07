// IMatchManager.cs
namespace BelieveOrNot.Server;

public interface IMatchManager
{
    Match? GetMatch(Guid matchId);
    Match CreateMatch(string playerName, GameSettings? settings = null, string clientId = "");
    Match JoinMatch(Guid matchId, string playerName, string clientId = "");
    void RemoveMatch(Guid matchId);
    List<Match> GetActiveMatches();
    void ShufflePlayersForNewRound(Match match); // Expose shuffle method
}
