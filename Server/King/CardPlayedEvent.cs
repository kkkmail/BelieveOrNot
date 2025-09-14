namespace BelieveOrNot.Server.King;

public record CardPlayedEvent
{
    public required string PlayerName { get; init; }
    public required Card Card { get; init; }
}
