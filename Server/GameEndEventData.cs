namespace BelieveOrNot.Server;

public class GameEndEventData
{
    public string InitiatorName { get; set; } = string.Empty;
    public List<string> WinnerNames { get; set; } = new();
    public int WinnerScore { get; set; }
    public List<PlayerFinalScore> FinalScores { get; set; } = new();
}