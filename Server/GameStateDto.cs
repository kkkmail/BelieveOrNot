public class GameStateDto
{
    public Guid MatchId { get; set; }
    public GamePhase Phase { get; set; }
    public List<PlayerStateDto> Players { get; set; } = new();
    public int TablePileCount { get; set; }
    public int LastPlayCardCount { get; set; }
    public string? AnnouncedRank { get; set; }
    public int CurrentPlayerIndex { get; set; }
    public int RoundNumber { get; set; }
    public List<Card>? YourHand { get; set; }
    public Guid? CreatorPlayerId { get; set; }
    
    // Added for dynamic rank dropdown
    public int DeckSize { get; set; }
    public int JokerCount { get; set; }
    
    // NEW: Structured event data instead of LastAction string
    public GameEventDto? Event { get; set; }
}