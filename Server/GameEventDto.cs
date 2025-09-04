// Server/GameEventDto.cs
public class GameEventDto
{
    public string Type { get; set; } = string.Empty;
    public string DisplayMessage { get; set; } = string.Empty;
    public object? Data { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class ChallengeEventData
{
    public string ChallengerName { get; set; } = string.Empty;
    public string ChallengedPlayerName { get; set; } = string.Empty;
    public int CardIndex { get; set; }
    public int TotalCards { get; set; }
    public Card RevealedCard { get; set; } = null!;
    public string AnnouncedRank { get; set; } = string.Empty;
    public bool IsMatch { get; set; }
    public string CollectorName { get; set; } = string.Empty;
    public int CardsCollected { get; set; }
}

public class CardPlayEventData
{
    public string PlayerName { get; set; } = string.Empty;
    public List<Card> CardsPlayed { get; set; } = new();
    public string DeclaredRank { get; set; } = string.Empty;
    public int RemainingCards { get; set; }
    public bool HasNoCardsLeft { get; set; }
}

public class RoundEndEventData
{
    public int RoundNumber { get; set; }
    public List<string> WinnerNames { get; set; } = new();
    public List<PlayerScoreResult> ScoreResults { get; set; } = new();
}

public class PlayerScoreResult
{
    public string PlayerName { get; set; } = string.Empty;
    public int ScoreChange { get; set; }
    public int TotalScore { get; set; }
    public bool IsWinner { get; set; }
    public int RegularCards { get; set; }
    public int JokerCards { get; set; }
    public int WinnerBonus { get; set; }
}

public class DisposalEventData
{
    public string PlayerName { get; set; } = string.Empty;
    public string Rank { get; set; } = string.Empty;
    public int CardsDisposed { get; set; } = 4;
}

public class ConnectionEventData
{
    public string PlayerName { get; set; } = string.Empty;
    public bool IsConnected { get; set; }
}

public class JoinEventData
{
    public string PlayerName { get; set; } = string.Empty;
    public bool IsCreator { get; set; }
}

public class GameEndEventData
{
    public string InitiatorName { get; set; } = string.Empty;
    public List<string> WinnerNames { get; set; } = new();
    public int WinnerScore { get; set; }
    public List<PlayerFinalScore> FinalScores { get; set; } = new();
}

public class PlayerFinalScore
{
    public string PlayerName { get; set; } = string.Empty;
    public int Score { get; set; }
    public int Position { get; set; }
}
