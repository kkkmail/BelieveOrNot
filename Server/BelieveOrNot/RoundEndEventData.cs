// BelieveOrNot/RoundEndEventData.cs
namespace BelieveOrNot.Server.BelieveOrNot;

public class RoundEndEventData
{
    public int RoundNumber { get; set; }
    public List<string> WinnerNames { get; set; } = new();
    public List<PlayerScoreResult> ScoreResults { get; set; } = new();
}
