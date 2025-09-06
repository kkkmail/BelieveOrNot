namespace BelieveOrNot.Server.King;

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