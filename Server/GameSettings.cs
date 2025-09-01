public class GameSettings
{
    public int DeckSize { get; set; } = 52;
    public int JokerCount { get; set; } = 0;
    public bool JokerDisposalEnabled { get; set; } = false;
    public int ScorePerCard { get; set; } = -1;
    public int ScorePerJoker { get; set; } = -3;
    public int WinnerBonus { get; set; } = 5;
    public int InviteTimeoutSeconds { get; set; } = 300;
}