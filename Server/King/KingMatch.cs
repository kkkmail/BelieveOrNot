namespace BelieveOrNot.Server.King;

public class KingMatch
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public KingGameSettings Settings { get; set; } = new();
    public List<KingPlayer> Players { get; set; } = new();
    public List<KingGameRound> GameRounds { get; set; } = new();
    public int CurrentRoundIndex { get; set; } = 0;
    public List<KingTrick> CurrentRoundTricks { get; set; } = new();
    public KingGamePhase Phase { get; set; } = KingGamePhase.WaitingForPlayers;
    public int CurrentPlayerIndex { get; set; } = 0;
    public int LeaderPlayerIndex { get; set; } = 0;
    public KingSuit? CurrentTrump { get; set; }
    public int TrumpSetterIndex { get; set; } = 0;
    public List<KingCard> CurrentTrick { get; set; } = new();
    public List<int> CurrentTrickPlayerOrder { get; set; } = new();
    public int CurrentGameNumber { get; set; } = 1;
    public bool MustDiscardKingOfHearts { get; set; } = false;
    public List<KingSuit> AvailableTrumpSuits { get; set; } = new();
    public Guid CreatorPlayerId { get; set; }
    
    public KingGameRound? CurrentRound => CurrentRoundIndex < GameRounds.Count ? GameRounds[CurrentRoundIndex] : null;
}