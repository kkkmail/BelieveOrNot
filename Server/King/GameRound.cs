// King/GameRound.cs
namespace BelieveOrNot.Server.King;

public class GameRound
{
    public int RoundNumber { get; set; }
    public GameRoundType RoundType { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool CanEndEarly { get; set; }
    public bool RequiresAllTricks { get; set; }
    public bool IsCollectingPhase { get; set; }
    public Suit? TrumpSuit { get; set; }

    // Scoring configuration
    public int PointsPerTrick { get; set; }
    public int PointsPerHeart { get; set; }
    public int PointsPerBoy { get; set; }
    public int PointsPerQueen { get; set; }
    public int PointsPerLastTrick { get; set; }
    public int PointsForKingOfHearts { get; set; }

    // Special rules
    public bool CannotLeadHearts { get; set; }
    public bool MustDiscardKingOfHearts { get; set; }

    public static GameRound CreateAvoidTricks(int roundNumber)
    {
        return new GameRound
        {
            RoundNumber = roundNumber,
            RoundType = GameRoundType.AvoidTricks,
            Name = "Don't take tricks",
            Description = "Avoid taking any tricks",
            CanEndEarly = true,
            RequiresAllTricks = false,
            IsCollectingPhase = false,
            PointsPerTrick = -2,
            MustDiscardKingOfHearts = true
        };
    }

    public static GameRound CreateAvoidHearts(int roundNumber)
    {
        return new GameRound
        {
            RoundNumber = roundNumber,
            RoundType = GameRoundType.AvoidHearts,
            Name = "Don't take Hearts",
            Description = "Avoid taking any Hearts cards",
            CanEndEarly = true,
            RequiresAllTricks = false,
            IsCollectingPhase = false,
            PointsPerHeart = -2,
            CannotLeadHearts = true,
            MustDiscardKingOfHearts = true
        };
    }

    public static GameRound CreateAvoidBoys(int roundNumber)
    {
        return new GameRound
        {
            RoundNumber = roundNumber,
            RoundType = GameRoundType.AvoidBoys,
            Name = "Don't take Boys",
            Description = "Avoid taking Jacks and Kings",
            CanEndEarly = true,
            RequiresAllTricks = false,
            IsCollectingPhase = false,
            PointsPerBoy = -2,
            MustDiscardKingOfHearts = true
        };
    }

    public static GameRound CreateAvoidQueens(int roundNumber)
    {
        return new GameRound
        {
            RoundNumber = roundNumber,
            RoundType = GameRoundType.AvoidQueens,
            Name = "Don't take Queens",
            Description = "Avoid taking any Queens",
            CanEndEarly = true,
            RequiresAllTricks = false,
            IsCollectingPhase = false,
            PointsPerQueen = -4,
            MustDiscardKingOfHearts = true
        };
    }

    public static GameRound CreateAvoidLastTwoTricks(int roundNumber)
    {
        return new GameRound
        {
            RoundNumber = roundNumber,
            RoundType = GameRoundType.AvoidLastTwoTricks,
            Name = "Don't take last 2 tricks",
            Description = "Avoid taking the last two tricks",
            CanEndEarly = false,
            RequiresAllTricks = true,
            IsCollectingPhase = false,
            PointsPerLastTrick = -8,
            MustDiscardKingOfHearts = true
        };
    }

    public static GameRound CreateAvoidKingOfHearts(int roundNumber)
    {
        return new GameRound
        {
            RoundNumber = roundNumber,
            RoundType = GameRoundType.AvoidKingOfHearts,
            Name = "Don't take King of Hearts",
            Description = "Avoid taking the King of Hearts",
            CanEndEarly = true,
            RequiresAllTricks = false,
            IsCollectingPhase = false,
            PointsForKingOfHearts = -16,
            MustDiscardKingOfHearts = true
        };
    }

    public static GameRound CreateAvoidEverything(int roundNumber)
    {
        return new GameRound
        {
            RoundNumber = roundNumber,
            RoundType = GameRoundType.AvoidEverything,
            Name = "Don't take anything",
            Description = "Avoid all penalties (combined round)",
            CanEndEarly = false,
            RequiresAllTricks = true,
            IsCollectingPhase = false,
            PointsPerTrick = -2,
            PointsPerHeart = -2,
            PointsPerBoy = -2,
            PointsPerQueen = -4,
            PointsPerLastTrick = -8,
            PointsForKingOfHearts = -16,
            CannotLeadHearts = true,
            MustDiscardKingOfHearts = true
        };
    }

    public static GameRound CreateCollectTricks(int roundNumber)
    // public static GameRound CreateCollectTricks(int roundNumber, Guid trumpChooser)
    {
        return new GameRound
        {
            RoundNumber = roundNumber,
            RoundType = GameRoundType.CollectTricks,
            Name = "Collect tricks",
            Description = "Collect as many tricks as possible",
            CanEndEarly = false,
            RequiresAllTricks = true,
            IsCollectingPhase = true,
            PointsPerTrick = 3,
        };
    }
}
