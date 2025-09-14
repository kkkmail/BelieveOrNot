namespace BelieveOrNot.Server.King;

public record RoundEndedEvent
{
    public required GameRound Round { get; init; }
    public required Dictionary<Guid, int> RoundScores { get; init; }
    public required bool WasEarlyTermination { get; init; }
    public required string EndReason { get; init; }
    public required int TricksCompleted { get; init; }
}