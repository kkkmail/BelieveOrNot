namespace BelieveOrNot.Server.King;

public record TrumpSelectedEvent
{
    public required string PlayerName { get; init; }
    public required string TrumpSuit { get; init; }
}