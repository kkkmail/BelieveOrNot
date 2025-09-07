// King/KingMatchManager.cs
namespace BelieveOrNot.Server.King;

public class KingMatchManager : IKingMatchManager
{
    private readonly ConcurrentDictionary<Guid, KingMatch> _matches = new();

    public KingMatch? GetMatch(Guid matchId)
    {
        _matches.TryGetValue(matchId, out var match);
        return match;
    }

    public KingMatch CreateMatch(string playerName, KingGameSettings? settings = null, string clientId = "")
    {
        var match = new KingMatch
        {
            Settings = settings ?? new KingGameSettings(),
            Players = new List<Player>
            {
                new Player {
                    Name = playerName,
                    ClientId = clientId,
                    LastSeen = DateTime.UtcNow
                }
            }
        };

        match.InitializeGameRounds();
        _matches.TryAdd(match.Id, match);
        return match;
    }

    public KingMatch JoinMatch(Guid matchId, string playerName, string clientId = "")
    {
        var match = GetMatch(matchId) ?? throw new InvalidOperationException("Match not found");

        if (match.Phase != GamePhase.WaitingForPlayers)
        {
            throw new InvalidOperationException("Cannot join match in progress");
        }

        if (match.Players.Count >= 4)
        {
            throw new InvalidOperationException("Match is full (4 players maximum)");
        }

        // Handle duplicate names
        var uniqueName = EnsureUniqueName(match, playerName);

        match.Players.Add(new Player {
            Name = uniqueName,
            ClientId = clientId,
            LastSeen = DateTime.UtcNow
        });

        return match;
    }

    public void RemoveMatch(Guid matchId)
    {
        _matches.TryRemove(matchId, out _);
    }

    public List<KingMatch> GetActiveMatches()
    {
        return _matches.Values.ToList();
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
}
