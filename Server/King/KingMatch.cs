// Server/King/KingMatch.cs
namespace BelieveOrNot.Server.King;

public record KingMatch
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public KingGameSettings Settings { get; set; } = new();
    public List<Player> Players { get; set; } = new();
    public GamePhase Phase { get; set; } = GamePhase.WaitingForPlayers;

    // Round management
    public List<GameRound> GameRounds { get; set; } = new();
    public int CurrentRoundIndex { get; set; } = 0;
    public GameRound? CurrentRound => CurrentRoundIndex < GameRounds.Count ? GameRounds[CurrentRoundIndex] : null;

    // Current round state
    public List<Trick> CompletedTricks { get; set; } = new();
    public Trick? CurrentTrick { get; set; }
    public int CurrentPlayerIndex { get; set; } = 0;
    public int RoundLeaderIndex { get; set; } = 0;

    // Trump selection for collecting phase
    public bool WaitingForTrumpSelection { get; set; } = false;
    public Suit? SelectedTrumpSuit { get; set; }

    public bool IsGameComplete => CurrentRoundIndex >= GameRounds.Count;
    public bool IsRoundComplete => CompletedTricks.Count == 8; // All tricks in a round
    public Player CurrentPlayer => Players[CurrentPlayerIndex];

    public void InitializeGameRounds()
    {
        GameRounds = Settings.CreateGameRounds();
    }
}
