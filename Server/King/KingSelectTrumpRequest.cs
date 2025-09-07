namespace BelieveOrNot.Server.King;

public class KingSelectTrumpRequest
{
    public Guid MatchId { get; set; }
    public Guid PlayerId { get; set; }
    public Suit TrumpSuit { get; set; }
}