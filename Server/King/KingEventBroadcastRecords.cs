// Server/King/KingEventBroadcastRecords.cs
namespace BelieveOrNot.Server.King;

public record CardPlayedEvent
{
    public required string PlayerName { get; init; }
    public required Card Card { get; init; }
}

public record TrumpSelectedEvent
{
    public required string PlayerName { get; init; }
    public required string TrumpSuit { get; init; }
}

public record TrickWonEvent
{
    public required string WinnerName { get; init; }
    public required Card WinningCard { get; init; }
    public required int TrickNumber { get; init; }
    public required List<PlayedCard> TrickCards { get; init; }
}

public record RoundEndedEvent
{
    public required GameRound Round { get; init; }
    public required Dictionary<Guid, int> RoundScores { get; init; }
    public required bool WasEarlyTermination { get; init; }
    public required string EndReason { get; init; }
    public required int TricksCompleted { get; init; }
}
