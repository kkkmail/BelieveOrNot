// Server/King/KingModels.cs
namespace BelieveOrNot.Server.King;

public record KingCard(KingRank Rank, KingSuit Suit)
{
    public override string ToString() => $"{Rank} of {Suit}";
    
    public bool IsKingOfHearts => Rank == KingRank.King && Suit == KingSuit.Hearts;
}

public class KingPlayer
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public List<KingCard> Hand { get; set; } = new();
    public int Score { get; set; } = 0;
    public bool IsConnected { get; set; } = true;
    public string ClientId { get; set; } = string.Empty;
    public DateTime LastSeen { get; set; } = DateTime.UtcNow;
    public int Position { get; set; } // 0-3, position at table
}

public class KingTrick
{
    public List<KingCard> Cards { get; set; } = new();
    public List<KingPlayer> PlayOrder { get; set; } = new();
    public KingPlayer Winner { get; set; } = null!;
    public KingSuit? Trump { get; set; }
    public KingSuit LeadSuit { get; set; }
    public int TrickNumber { get; set; }
}

public class KingMatch
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public KingGameSettings Settings { get; set; } = new();
    public List<KingPlayer> Players { get; set; } = new();
    public List<KingGameRound> GameRounds { get; set; } = new();
    public int CurrentRoundIndex { get; set; } = 0;
    public List<KingTrick> CurrentRoundTricks { get; set; } = new();
    public KingGamePhase Phase { get; set; } = KingGamePhase.WaitingForPlayers;
    public int CurrentPlayerIndex { get; set; } = 0;
    public int LeaderPlayerIndex { get; set; } = 0;
    public KingSuit? CurrentTrump { get; set; }
    public int TrumpSetterIndex { get; set; } = 0;
    public List<KingCard> CurrentTrick { get; set; } = new();
    public List<int> CurrentTrickPlayerOrder { get; set; } = new();
    public int CurrentGameNumber { get; set; } = 1;
    public bool MustDiscardKingOfHearts { get; set; } = false;
    public List<KingSuit> AvailableTrumpSuits { get; set; } = new();
    public Guid CreatorPlayerId { get; set; }
    
    public KingGameRound? CurrentRound => CurrentRoundIndex < GameRounds.Count ? GameRounds[CurrentRoundIndex] : null;
}

public class KingGameSettings
{
    public bool IncludeDontTakeAnything { get; set; } = false;
    public bool EightCollectingRounds { get; set; } = true;
}

public class KingGameStateDto
{
    public Guid MatchId { get; set; }
    public KingGamePhase Phase { get; set; }
    public List<KingPlayerStateDto> Players { get; set; } = new();
    public int CurrentRoundIndex { get; set; }
    public string CurrentRoundName { get; set; } = string.Empty;
    public string CurrentRoundDescription { get; set; } = string.Empty;
    public bool IsCollectingPhase { get; set; }
    public int CurrentPlayerIndex { get; set; }
    public int LeaderPlayerIndex { get; set; }
    public KingSuit? CurrentTrump { get; set; }
    public int TrumpSetterIndex { get; set; }
    public List<KingCard> CurrentTrick { get; set; } = new();
    public List<int> CurrentTrickPlayerOrder { get; set; } = new();
    public Guid CreatorPlayerId { get; set; }
    public int TotalRounds { get; set; }
    public bool CanSelectTrump { get; set; }
    public bool WaitingForTrumpSelection { get; set; }
    public bool MustDiscardKingOfHearts { get; set; }
    public List<KingSuit> AvailableTrumpSuits { get; set; } = new();
    public KingEarlyEndCondition EarlyEndCondition { get; set; }
    public KingScoreCalculator ScoreCalculator { get; set; }
    public List<KingCard> YourHand { get; set; } = new();
    public KingEventDto? Event { get; set; }
}

public class KingPlayerStateDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int HandCount { get; set; }
    public int Score { get; set; }
    public bool IsConnected { get; set; }
    public int Position { get; set; }
}

public class KingEventDto
{
    public string Type { get; set; } = string.Empty;
    public string DisplayMessage { get; set; } = string.Empty;
    public object? Data { get; set; }
}