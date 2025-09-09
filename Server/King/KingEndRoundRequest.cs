// King/Dto/KingEndRoundRequest.cs
namespace BelieveOrNot.Server.King;

public class KingEndRoundRequest
{
    public Guid MatchId { get; set; }
    public Guid PlayerId { get; set; }
}