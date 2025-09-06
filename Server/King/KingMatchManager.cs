// Server/King/KingMatchManager.cs
using System.Collections.Concurrent;

namespace BelieveOrNot.Server.King;

public class KingMatchManager : IKingMatchManager
{
    private readonly ConcurrentDictionary<Guid, KingMatch> _matches = new();

    public KingMatch? GetMatch(Guid matchId)
    {
        return _matches.TryGetValue(matchId, out var match) ? match : null;
    }

    public KingMatch CreateMatch(string playerName, KingGameSettings? settings = null, string clientId = "")
    {
        var match = new KingMatch
        {
            Id = Guid.NewGuid(),
            Settings = settings ?? new KingGameSettings(),
            GameRounds = KingGameRound.CreateStandardGameRounds(
                settings?.IncludeDontTakeAnything ?? false,
                settings?.EightCollectingRounds ?? true)
        };

        var player = new KingPlayer
        {
            Id = Guid.NewGuid(),
            Name = playerName,
            ClientId = clientId,
            Position = 0
        };

        match.Players.Add(player);
        match.CreatorPlayerId = player.Id;

        _matches[match.Id] = match;
        return match;
    }

    public KingMatch JoinMatch(Guid matchId, string playerName, string clientId = "")
    {
        var match = GetMatch(matchId);
        if (match == null)
        {
            throw new InvalidOperationException("Match not found");
        }

        if (match.Players.Count >= 4)
        {
            throw new InvalidOperationException("Match is full");
        }

        if (match.Phase != KingGamePhase.WaitingForPlayers)
        {
            throw new InvalidOperationException("Match has already started");
        }

        // Check if player with this clientId already exists
        var existingPlayer = match.Players.FirstOrDefault(p => p.ClientId == clientId);
        if (existingPlayer != null)
        {
            existingPlayer.IsConnected = true;
            existingPlayer.LastSeen = DateTime.UtcNow;
            return match;
        }

        // Ensure unique name
        var finalName = EnsureUniqueName(match, playerName);

        var player = new KingPlayer
        {
            Id = Guid.NewGuid(),
            Name = finalName,
            ClientId = clientId,
            Position = match.Players.Count
        };

        match.Players.Add(player);
        return match;
    }

    public void RemoveMatch(Guid matchId)
    {
        _matches.TryRemove(matchId, out _);
    }

    public List<KingMatch> GetActiveMatches()
    {
        return _matches.Values
            .Where(m => m.Phase != KingGamePhase.GameEnd)
            .ToList();
    }

    public void AssignPlayerPositions(KingMatch match)
    {
        for (int i = 0; i < match.Players.Count; i++)
        {
            match.Players[i].Position = i;
        }
    }

    private string EnsureUniqueName(KingMatch match, string desiredName)
    {
        var existingNames = match.Players.Select(p => p.Name.ToLower()).ToHashSet();
        
        if (!existingNames.Contains(desiredName.ToLower()))
        {
            return desiredName;
        }

        // Try numbered variants
        for (int i = 2; i <= 99; i++)
        {
            var numberedName = $"{desiredName} ({i})";
            if (!existingNames.Contains(numberedName.ToLower()))
            {
                return numberedName;
            }
        }

        // Fallback
        return $"{desiredName} ({Guid.NewGuid().ToString()[..8]})";
    }
}