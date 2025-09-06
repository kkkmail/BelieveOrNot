// Server/King/KingRequests.cs
namespace BelieveOrNot.Server.King;

public class KingCreateMatchRequest
{
    public string PlayerName { get; set; } = string.Empty;
    public KingGameSettings? Settings { get; set; }
    public string? ClientId { get; set; }
}