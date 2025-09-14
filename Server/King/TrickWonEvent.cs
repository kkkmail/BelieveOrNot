namespace BelieveOrNot.Server.King;

public record TrickWonEvent
{
    public required string WinnerName { get; init; }
    public required Card WinningCard { get; init; }
    public required int TrickNumber { get; init; }
    public required List<PlayedCard> TrickCards { get; init; }
}