// ReconnectionResponse.cs
namespace BelieveOrNot.Server;

public class ReconnectionResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public Match? Match { get; set; }
    public GameStateDto? GameState { get; set; }
    public Guid? PlayerId { get; set; }
}
