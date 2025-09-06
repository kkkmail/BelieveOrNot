// Server/King/KingGameRound.cs
namespace BelieveOrNot.Server.King;

public class KingGameRound
{
    public int RoundNumber { get; set; }
    public KingRoundType Type { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int PointsPerItem { get; set; }
    public bool CanEndEarly { get; set; }
    public bool IsCollectingPhase { get; set; }
    public bool RequiresTrumpSelection { get; set; }
    public Func<KingCard, bool>? PenaltyCardFilter { get; set; }
    public Func<List<KingTrick>, bool>? EarlyEndCondition { get; set; }
    public Func<KingPlayer, List<KingTrick>, int>? ScoreCalculator { get; set; }

    public static List<KingGameRound> CreateStandardGameRounds(bool includeDontTakeAnything, bool eightCollectingRounds)
    {
        var rounds = new List<KingGameRound>();

        // Phase 1: Avoiding rounds
        rounds.Add(new KingGameRound
        {
            RoundNumber = 1,
            Type = KingRoundType.DontTakeTricks,
            Name = "Don't Take Tricks",
            Description = "Avoid taking any tricks (-2 points per trick)",
            PointsPerItem = -2,
            CanEndEarly = true,
            IsCollectingPhase = false,
            RequiresTrumpSelection = false,
            EarlyEndCondition = tricks => tricks.Count >= 8,
            ScoreCalculator = (player, tricks) => -2 * tricks.Count(t => t.Winner.Id == player.Id)
        });

        rounds.Add(new KingGameRound
        {
            RoundNumber = 2,
            Type = KingRoundType.DontTakeHearts,
            Name = "Don't Take Hearts",
            Description = "Avoid taking Hearts cards (-2 points per Heart)",
            PointsPerItem = -2,
            CanEndEarly = true,
            IsCollectingPhase = false,
            RequiresTrumpSelection = false,
            PenaltyCardFilter = card => card.Suit == KingSuit.Hearts,
            EarlyEndCondition = tricks => 
            {
                var heartsTaken = tricks.SelectMany(t => t.Cards).Count(c => c.Suit == KingSuit.Hearts);
                return heartsTaken >= 8; // All 8 Hearts in 32-card deck
            },
            ScoreCalculator = (player, tricks) =>
            {
                var heartsWon = tricks.Where(t => t.Winner.Id == player.Id)
                    .SelectMany(t => t.Cards)
                    .Count(c => c.Suit == KingSuit.Hearts);
                return -2 * heartsWon;
            }
        });

        rounds.Add(new KingGameRound
        {
            RoundNumber = 3,
            Type = KingRoundType.DontTakeBoys,
            Name = "Don't Take Boys",
            Description = "Avoid taking Jacks and Kings (-2 points per Boy)",
            PointsPerItem = -2,
            CanEndEarly = true,
            IsCollectingPhase = false,
            RequiresTrumpSelection = false,
            PenaltyCardFilter = card => card.Rank == KingRank.Jack || card.Rank == KingRank.King,
            EarlyEndCondition = tricks =>
            {
                var boysTaken = tricks.SelectMany(t => t.Cards).Count(c => c.Rank == KingRank.Jack || c.Rank == KingRank.King);
                return boysTaken >= 8; // All Boys in 32-card deck
            },
            ScoreCalculator = (player, tricks) =>
            {
                var boysWon = tricks.Where(t => t.Winner.Id == player.Id)
                    .SelectMany(t => t.Cards)
                    .Count(c => c.Rank == KingRank.Jack || c.Rank == KingRank.King);
                return -2 * boysWon;
            }
        });

        rounds.Add(new KingGameRound
        {
            RoundNumber = 4,
            Type = KingRoundType.DontTakeQueens,
            Name = "Don't Take Queens",
            Description = "Avoid taking Queens (-4 points per Queen)",
            PointsPerItem = -4,
            CanEndEarly = true,
            IsCollectingPhase = false,
            RequiresTrumpSelection = false,
            PenaltyCardFilter = card => card.Rank == KingRank.Queen,
            EarlyEndCondition = tricks =>
            {
                var queensTaken = tricks.SelectMany(t => t.Cards).Count(c => c.Rank == KingRank.Queen);
                return queensTaken >= 4; // All Queens in deck
            },
            ScoreCalculator = (player, tricks) =>
            {
                var queensWon = tricks.Where(t => t.Winner.Id == player.Id)
                    .SelectMany(t => t.Cards)
                    .Count(c => c.Rank == KingRank.Queen);
                return -4 * queensWon;
            }
        });

        rounds.Add(new KingGameRound
        {
            RoundNumber = 5,
            Type = KingRoundType.DontTakeLastTwoTricks,
            Name = "Don't Take Last 2 Tricks",
            Description = "Avoid taking the last 2 tricks (-8 points each)",
            PointsPerItem = -8,
            CanEndEarly = false,
            IsCollectingPhase = false,
            RequiresTrumpSelection = false,
            ScoreCalculator = (player, tricks) =>
            {
                var tricksWon = tricks.Where(t => t.Winner.Id == player.Id).ToList();
                var lastTwoTricks = tricks.TakeLast(2).ToList();
                var lastTwoWon = tricksWon.Intersect(lastTwoTricks).Count();
                return -8 * lastTwoWon;
            }
        });

        rounds.Add(new KingGameRound
        {
            RoundNumber = 6,
            Type = KingRoundType.DontTakeKingOfHearts,
            Name = "Don't Take King of Hearts",
            Description = "Avoid taking the King of Hearts (-16 points)",
            PointsPerItem = -16,
            CanEndEarly = true,
            IsCollectingPhase = false,
            RequiresTrumpSelection = false,
            PenaltyCardFilter = card => card.Rank == KingRank.King && card.Suit == KingSuit.Hearts,
            EarlyEndCondition = tricks =>
            {
                return tricks.SelectMany(t => t.Cards).Any(c => c.Rank == KingRank.King && c.Suit == KingSuit.Hearts);
            },
            ScoreCalculator = (player, tricks) =>
            {
                var hasKingOfHearts = tricks.Where(t => t.Winner.Id == player.Id)
                    .SelectMany(t => t.Cards)
                    .Any(c => c.Rank == KingRank.King && c.Suit == KingSuit.Hearts);
                return hasKingOfHearts ? -16 : 0;
            }
        });

        // Optional round
        if (includeDontTakeAnything)
        {
            rounds.Add(new KingGameRound
            {
                RoundNumber = 7,
                Type = KingRoundType.DontTakeAnything,
                Name = "Don't Take Anything",
                Description = "Avoid all penalties combined (-96 points total)",
                PointsPerItem = -96,
                CanEndEarly = false,
                IsCollectingPhase = false,
                RequiresTrumpSelection = false,
                ScoreCalculator = (player, tricks) =>
                {
                    var tricksWon = tricks.Where(t => t.Winner.Id == player.Id).ToList();
                    var cardsWon = tricksWon.SelectMany(t => t.Cards).ToList();

                    int penalty = 0;
                    penalty += tricksWon.Count * -2; // Tricks
                    penalty += cardsWon.Count(c => c.Suit == KingSuit.Hearts) * -2; // Hearts
                    penalty += cardsWon.Count(c => c.Rank == KingRank.Jack || c.Rank == KingRank.King) * -2; // Boys
                    penalty += cardsWon.Count(c => c.Rank == KingRank.Queen) * -4; // Queens
                    
                    var lastTwoTricks = tricks.TakeLast(2).ToList();
                    var lastTwoWon = tricksWon.Intersect(lastTwoTricks).Count();
                    penalty += lastTwoWon * -8; // Last two tricks
                    
                    var hasKingOfHearts = cardsWon.Any(c => c.Rank == KingRank.King && c.Suit == KingSuit.Hearts);
                    penalty += hasKingOfHearts ? -16 : 0; // King of Hearts

                    return penalty;
                }
            });
        }

        // Phase 2: Collecting rounds
        int collectingRounds = eightCollectingRounds ? 8 : 4;
        int startingRoundNumber = rounds.Count + 1;

        for (int i = 0; i < collectingRounds; i++)
        {
            rounds.Add(new KingGameRound
            {
                RoundNumber = startingRoundNumber + i,
                Type = KingRoundType.CollectTricks,
                Name = $"Collect Tricks {i + 1}",
                Description = "Collect as many tricks as possible (+3 points per trick)",
                PointsPerItem = 3,
                CanEndEarly = false,
                IsCollectingPhase = true,
                RequiresTrumpSelection = true,
                ScoreCalculator = (player, tricks) => 3 * tricks.Count(t => t.Winner.Id == player.Id)
            });
        }

        return rounds;
    }
}