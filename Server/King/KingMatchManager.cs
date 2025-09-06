// Server/King/KingMatchManager.cs
using System.Collections.Concurrent;

namespace BelieveOrNot.Server.King;

public class KingMatchManager : IKingMatchManager
{
    private readonly ConcurrentDictionary<Guid, KingMatch> _matches = new();
    private readonly Random _random = new();

    public KingMatch? GetMatch(Guid matchId)
    {
        _matches.TryGetValue(matchId, out var match);
        return match;
    }

    public KingMatch CreateMatch(string playerName, KingGameSettings? settings = null, string clientId = "")
    {
        var gameSettings = settings ?? new KingGameSettings();
        
        var match = new KingMatch
        {
            Settings = gameSettings,
            GameRounds = KingGameRound.CreateStandardGameRounds(
                gameSettings.IncludeDontTakeAnything, 
                gameSettings.EightCollectingRounds),
            Players = new List<KingPlayer>
            {
                new KingPlayer 
                {
                    Name = playerName,
                    ClientId = clientId,
                    LastSeen = DateTime.UtcNow,
                    Position = 0 // Creator always gets position 0 (left side)
                }
            }
        };

        _matches.TryAdd(match.Id, match);
        return match;
    }

    public KingMatch JoinMatch(Guid matchId, string playerName, string clientId = "")
    {
        var match = GetMatch(matchId) ?? throw new InvalidOperationException("Match not found");

        if (match.Phase != KingGamePhase.WaitingForPlayers)
        {
            throw new InvalidOperationException("Cannot join match in progress");
        }

        if (match.Players.Count >= 4)
        {
            throw new InvalidOperationException("Match is full (4 players required)");
        }

        // Handle duplicate names
        var uniqueName = EnsureUniqueName(match, playerName);

        var newPlayer = new KingPlayer 
        {
            Name = uniqueName,
            ClientId = clientId,
            LastSeen = DateTime.UtcNow
        };

        match.Players.Add(newPlayer);

        // Assign positions when we have all 4 players
        if (match.Players.Count == 4)
        {
            AssignPlayerPositions(match);
        }

        return match;
    }

    public void AssignPlayerPositions(KingMatch match)
    {
        if (match.Players.Count != 4)
        {
            throw new InvalidOperationException("Need exactly 4 players to assign positions");
        }

        // Creator stays at position 0 (left), randomly assign others to positions 1,2,3
        var creator = match.Players[0];
        creator.Position = 0;

        var otherPlayers = match.Players.Skip(1).ToList();
        var availablePositions = new List<int> { 1, 2, 3 };

        // Shuffle the available positions
        for (int i = availablePositions.Count - 1; i > 0; i--)
        {
            int j = _random.Next(i + 1);
            (availablePositions[i], availablePositions[j]) = (availablePositions[j], availablePositions[i]);
        }

        // Assign positions
        for (int i = 0; i < otherPlayers.Count; i++)
        {
            otherPlayers[i].Position = availablePositions[i];
        }

        // Sort players by position for consistent ordering
        match.Players.Sort((a, b) => a.Position.CompareTo(b.Position));

        Console.WriteLine($"Player positions assigned: {string.Join(", ", match.Players.Select(p => $"{p.Name}({p.Position})"))}");
    }

    private string EnsureUniqueName(KingMatch match, string desiredName)
    {
        var existingNames = match.Players.Select(p => p.Name).ToHashSet();

        if (!existingNames.Contains(desiredName))
        {
            return desiredName;
        }

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

    public List<KingMatch> GetActiveMatches()
    {
        return _matches.Values.ToList();
    }
}