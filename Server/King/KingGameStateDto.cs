// Server/King/KingGameStateDto.cs
namespace BelieveOrNot.Server.King;

public class KingGameStateDto
{
    public Guid MatchId { get; set; }
    public GamePhase Phase { get; set; }
    public List<KingPlayerStateDto> Players { get; set; } = new();
    public int CurrentPlayerIndex { get; set; }
    public int CurrentRoundIndex { get; set; }
    public GameRound? CurrentRound { get; set; }
    public List<Trick> CompletedTricks { get; set; } = new();
    public Trick? CurrentTrick { get; set; }
    public bool WaitingForTrumpSelection { get; set; }
    public Suit? SelectedTrumpSuit { get; set; }
    public List<Card>? YourHand { get; set; }
    public List<Card>? TrumpSelectionCards { get; set; }
}
