namespace BelieveOrNot.Server.King;

public class KingStartRoundRequest
{
    public Guid MatchId { get; set; }
    public Guid PlayerId { get; set; }
}