// King/KingJoinMatchRequest.cs
namespace BelieveOrNot.Server.King;

public class KingJoinMatchRequest
{
    public string MatchId { get; set; } = string.Empty;
    public string PlayerName { get; set; } = string.Empty;
    public string? ClientId { get; set; }
}
