namespace BelieveOrNot.Server.King;

public class KingPlayCardRequest
{
    public Guid MatchId { get; set; }
    public Guid PlayerId { get; set; }
    public Card Card { get; set; } = null!;
}