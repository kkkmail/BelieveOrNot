// GameSettings.cs
namespace BelieveOrNot.Server;

public class GameSettings
{
    // These are default values - will be overridden by appsettings.json if present
    public DeckSize DeckSize { get; set; } = DeckSize.Full;
    public int JokerCount { get; set; } = 0;
    public bool JokerDisposalEnabled { get; set; } = false;
    public int ScorePerCard { get; set; } = -1;
    public int ScorePerJoker { get; set; } = -3;
    public int WinnerBonus { get; set; } = 5;
    public int InviteTimeoutSeconds { get; set; } = 300;
    
    // Additional configurable settings
    public int MaxCardsPerPlay { get; set; } = 3;
    public int MinCardsPerPlay { get; set; } = 1;
    public int AutoDisposeMinSameRank { get; set; } = 4;
}
