// PlayerScoreResult.cs
namespace BelieveOrNot.Server;

public class PlayerScoreResult
{
    public string PlayerName { get; set; } = string.Empty;
    public int ScoreChange { get; set; }
    public int TotalScore { get; set; }
    public bool IsWinner { get; set; }
    public int RegularCards { get; set; }
    public int JokerCards { get; set; }
    public int WinnerBonus { get; set; }
}
