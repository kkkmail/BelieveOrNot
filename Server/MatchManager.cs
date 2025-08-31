using System.Collections.Concurrent;

public class MatchManager : IMatchManager
{
    private readonly ConcurrentDictionary<Guid, Match> _matches = new();
    
    public Match? GetMatch(Guid matchId)
    {
        _matches.TryGetValue(matchId, out var match);
        return match;
    }
    
    public Match CreateMatch(string playerName, GameSettings? settings = null)
    {
        var match = new Match
        {
            Settings = settings ?? new GameSettings(),
            Players = new List<Player>
            {
                new Player { Name = playerName }
            }
        };
        
        _matches.TryAdd(match.Id, match);
        return match;
    }
    
    public Match JoinMatch(Guid matchId, string playerName)
    {
        var match = GetMatch(matchId) ?? throw new InvalidOperationException("Match not found");
        
        if (match.Phase != GamePhase.WaitingForPlayers)
        {
            throw new InvalidOperationException("Cannot join match in progress");
        }
        
        match.Players.Add(new Player { Name = playerName });
        return match;
    }
    
    public void RemoveMatch(Guid matchId)
    {
        _matches.TryRemove(matchId, out _);
    }
    
    public List<Match> GetActiveMatches()
    {
        return _matches.Values.ToList();
    }
}