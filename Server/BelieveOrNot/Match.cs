// BelieveOrNot/Match.cs
namespace BelieveOrNot.Server.BelieveOrNot;

public class Match
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public GameSettings Settings { get; set; } = new();
    public List<Player> Players { get; set; } = new();
    public List<Card> TablePile { get; set; } = new();
    public string? AnnouncedRank { get; set; }
    public int CurrentPlayerIndex { get; set; } = 0;
    public int DealerIndex { get; set; } = 0;
    public int LastPlayCardCount { get; set; } = 0;
    public GamePhase Phase { get; set; } = GamePhase.WaitingForPlayers;
    public int RoundNumber { get; set; } = 0;
    public string? LastRoundEndMessage { get; set; } // Added for round end event broadcasting

    // NEW: Track disposed ranks for this round
    public HashSet<string> DisposedRanks { get; set; } = new();
    public int? LastActualPlayerIndex { get; set; } // Track who actually played last
}
