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
    
    // Replace Func properties with enums
    public KingPenaltyCardFilter PenaltyCardFilterType { get; set; } = KingPenaltyCardFilter.None;
    public KingEarlyEndCondition EarlyEndConditionType { get; set; } = KingEarlyEndCondition.None;
    public KingScoreCalculator ScoreCalculatorType { get; set; } = KingScoreCalculator.TricksCount;

    // Helper methods to get the actual functions from enums
    public Func<KingCard, bool>? GetPenaltyCardFilter()
    {
        return PenaltyCardFilterType switch
        {
            KingPenaltyCardFilter.None => null,
            KingPenaltyCardFilter.Hearts => card => card.Suit == KingSuit.Hearts,
            KingPenaltyCardFilter.BoysJacksAndKings => card => card.Rank == KingRank.Jack || card.Rank == KingRank.King,
            KingPenaltyCardFilter.Queens => card => card.Rank == KingRank.Queen,
            KingPenaltyCardFilter.KingOfHearts => card => card.Rank == KingRank.King && card.Suit == KingSuit.Hearts,
            KingPenaltyCardFilter.Everything => _ => true,
            _ => null
        };
    }

    public Func<List<KingTrick>, bool>? GetEarlyEndCondition()
    {
        return EarlyEndConditionType switch
        {
            KingEarlyEndCondition.None => null,
            KingEarlyEndCondition.AllTricksPlayed => tricks => tricks.Count >= 8,
            KingEarlyEndCondition.AllHeartsPlayed => tricks => tricks.SelectMany(t => t.Cards).Count(c => c.Suit == KingSuit.Hearts) >= 8,
            KingEarlyEndCondition.AllBoysPlayed => tricks => tricks.SelectMany(t => t.Cards).Count(c => c.Rank == KingRank.Jack || c.Rank == KingRank.King) >= 8,
            KingEarlyEndCondition.AllQueensPlayed => tricks => tricks.SelectMany(t => t.Cards).Count(c => c.Rank == KingRank.Queen) >= 4,
            KingEarlyEndCondition.KingOfHeartsPlayed => tricks => tricks.SelectMany(t => t.Cards).Any(c => c.Rank == KingRank.King && c.Suit == KingSuit.Hearts),
            _ => null
        };
    }

    public Func<KingPlayer, List<KingTrick>, int>? GetScoreCalculator()
    {
        return ScoreCalculatorType switch
        {
            KingScoreCalculator.TricksCount => (player, tricks) => PointsPerItem * tricks.Count(t => t.Winner.Id == player.Id),
            KingScoreCalculator.HeartsCount => (player, tricks) => 
            {
                var heartsWon = tricks.Where(t => t.Winner.Id == player.Id)
                    .SelectMany(t => t.Cards)
                    .Count(c => c.Suit == KingSuit.Hearts);
                return PointsPerItem * heartsWon;
            },
            KingScoreCalculator.BoysCount => (player, tricks) =>
            {
                var boysWon = tricks.Where(t => t.Winner.Id == player.Id)
                    .SelectMany(t => t.Cards)
                    .Count(c => c.Rank == KingRank.Jack || c.Rank == KingRank.King);
                return PointsPerItem * boysWon;
            },
            KingScoreCalculator.QueensCount => (player, tricks) =>
            {
                var queensWon = tricks.Where(t => t.Winner.Id == player.Id)
                    .SelectMany(t => t.Cards)
                    .Count(c => c.Rank == KingRank.Queen);
                return PointsPerItem * queensWon;
            },
            KingScoreCalculator.LastTwoTricks => (player, tricks) =>
            {
                var tricksWon = tricks.Where(t => t.Winner.Id == player.Id).ToList();
                var lastTwoTricks = tricks.TakeLast(2).ToList();
                var lastTwoWon = tricksWon.Intersect(lastTwoTricks).Count();
                return PointsPerItem * lastTwoWon;
            },
            KingScoreCalculator.KingOfHearts => (player, tricks) =>
            {
                var hasKingOfHearts = tricks.Where(t => t.Winner.Id == player.Id)
                    .SelectMany(t => t.Cards)
                    .Any(c => c.Rank == KingRank.King && c.Suit == KingSuit.Hearts);
                return hasKingOfHearts ? PointsPerItem : 0;
            },
            KingScoreCalculator.Everything => (player, tricks) =>
            {
                var tricksWon = tricks.Count(t => t.Winner.Id == player.Id);
                var cardsWon = tricks.Where(t => t.Winner.Id == player.Id).SelectMany(t => t.Cards).Count();
                return PointsPerItem * (tricksWon + cardsWon);
            },
            KingScoreCalculator.PositiveTricks => (player, tricks) => Math.Abs(PointsPerItem) * tricks.Count(t => t.Winner.Id == player.Id),
            _ => (player, tricks) => 0
        };
    }

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
            EarlyEndConditionType = KingEarlyEndCondition.AllTricksPlayed,
            ScoreCalculatorType = KingScoreCalculator.TricksCount
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
            PenaltyCardFilterType = KingPenaltyCardFilter.Hearts,
            EarlyEndConditionType = KingEarlyEndCondition.AllHeartsPlayed,
            ScoreCalculatorType = KingScoreCalculator.HeartsCount
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
            PenaltyCardFilterType = KingPenaltyCardFilter.BoysJacksAndKings,
            EarlyEndConditionType = KingEarlyEndCondition.AllBoysPlayed,
            ScoreCalculatorType = KingScoreCalculator.BoysCount
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
            PenaltyCardFilterType = KingPenaltyCardFilter.Queens,
            EarlyEndConditionType = KingEarlyEndCondition.AllQueensPlayed,
            ScoreCalculatorType = KingScoreCalculator.QueensCount
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
            ScoreCalculatorType = KingScoreCalculator.LastTwoTricks
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
            PenaltyCardFilterType = KingPenaltyCardFilter.KingOfHearts,
            EarlyEndConditionType = KingEarlyEndCondition.KingOfHeartsPlayed,
            ScoreCalculatorType = KingScoreCalculator.KingOfHearts
        });

        if (includeDontTakeAnything)
        {
            rounds.Add(new KingGameRound
            {
                RoundNumber = 7,
                Type = KingRoundType.DontTakeAnything,
                Name = "Don't Take Anything",
                Description = "Avoid taking any tricks or cards (-2 points each)",
                PointsPerItem = -2,
                CanEndEarly = true,
                IsCollectingPhase = false,
                RequiresTrumpSelection = false,
                PenaltyCardFilterType = KingPenaltyCardFilter.Everything,
                EarlyEndConditionType = KingEarlyEndCondition.AllTricksPlayed,
                ScoreCalculatorType = KingScoreCalculator.Everything
            });
        }

        // Phase 2: Collecting rounds
        int collectingRoundCount = eightCollectingRounds ? 8 : 4;
        int startingRoundNumber = rounds.Count + 1;

        for (int i = 0; i < collectingRoundCount; i++)
        {
            rounds.Add(new KingGameRound
            {
                RoundNumber = startingRoundNumber + i,
                Type = KingRoundType.CollectTricks,
                Name = $"Collect Tricks {i + 1}",
                Description = "Try to win as many tricks as possible (+2 points per trick)",
                PointsPerItem = 2,
                CanEndEarly = false,
                IsCollectingPhase = true,
                RequiresTrumpSelection = true,
                ScoreCalculatorType = KingScoreCalculator.PositiveTricks
            });
        }

        return rounds;
    }
}