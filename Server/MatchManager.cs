using System.Collections.Concurrent;

public class MatchManager : IMatchManager
{
    private readonly ConcurrentDictionary<Guid, Match> _matches = new();
    private readonly Random _random = new();
    
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
                new Player { Name = playerName } // Creator is always first, never shuffled
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
        
        // Handle duplicate names
        var uniqueName = EnsureUniqueName(match, playerName);
        
        match.Players.Add(new Player { Name = uniqueName });
        return match;
    }
    
    // Shuffle players (except creator) before new round
    public void ShufflePlayersForNewRound(Match match)
    {
        if (match.Players.Count <= 2) 
        {
            Console.WriteLine("No shuffling needed: 2 or fewer players");
            return; // No need to shuffle with 2 or fewer players
        }
        
        // Keep the creator (first player) in position, shuffle the rest
        var creator = match.Players[0];
        var otherPlayers = match.Players.Skip(1).ToList();
        
        Console.WriteLine($"Before shuffle: {string.Join(", ", match.Players.Select(p => p.Name))}");
        
        // Shuffle other players using Fisher-Yates algorithm
        for (int i = otherPlayers.Count - 1; i > 0; i--)
        {
            int j = _random.Next(i + 1);
            (otherPlayers[i], otherPlayers[j]) = (otherPlayers[j], otherPlayers[i]);
        }
        
        // Rebuild players list with creator first
        match.Players.Clear();
        match.Players.Add(creator);
        match.Players.AddRange(otherPlayers);
        
        Console.WriteLine($"After shuffle: {string.Join(", ", match.Players.Select(p => p.Name))}");
        Console.WriteLine($"Creator '{creator.Name}' remains at position 0");
    }
    
    // Ensure unique player names
    private string EnsureUniqueName(Match match, string desiredName)
    {
        var existingNames = match.Players.Select(p => p.Name).ToHashSet();
        
        if (!existingNames.Contains(desiredName))
        {
            return desiredName; // Name is unique
        }
        
        // Find next available number suffix
        int counter = 2;
        string uniqueName;
        do
        {
            uniqueName = $"{desiredName} ({counter})";
            counter++;
        }
        while (existingNames.Contains(uniqueName));
        
        Console.WriteLine($"Duplicate name '{desiredName}' changed to '{uniqueName}'");
        return uniqueName;
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