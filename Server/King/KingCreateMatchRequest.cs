// King/KingCreateMatchRequest.cs
namespace BelieveOrNot.Server.King;

public record KingCreateMatchRequest
{
    public string PlayerName { get; set; } = string.Empty;
    public KingGameSettings? Settings { get; set; }
    public string? ClientId { get; set; }
}
