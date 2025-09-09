// King/KingReconnectionResponse.cs
namespace BelieveOrNot.Server.King;

public class KingReconnectionResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public KingMatch? Match { get; set; }
    public KingGameStateDto? GameState { get; set; }
    public Guid? PlayerId { get; set; }
}
