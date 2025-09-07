// King/KingScorer.cs
namespace BelieveOrNot.Server.King;

public static class KingScorer
{
    public static Dictionary<Guid, int> CalculateRoundScores(KingMatch match, GameRound round)
    {
        var scores = new Dictionary<Guid, int>();

        // Initialize all players to 0
        foreach (var player in match.Players)
        {
            scores[player.Id] = 0;
        }

        if (round.IsCollectingPhase)
        {
            return CalculateCollectingScores(match, round, scores);
        }
        else
        {
            return CalculateAvoidingScores(match, round, scores);
        }
    }

    private static Dictionary<Guid, int> CalculateCollectingScores(KingMatch match, GameRound round, Dictionary<Guid, int> scores)
    {
        // Collecting phase: +3 points per trick
        foreach (var trick in match.CompletedTricks)
        {
            if (trick.WinnerId.HasValue)
            {
                scores[trick.WinnerId.Value] += round.PointsPerTrick;
            }
        }

        return scores;
    }

    private static Dictionary<Guid, int> CalculateAvoidingScores(KingMatch match, GameRound round, Dictionary<Guid, int> scores)
    {
        foreach (var trick in match.CompletedTricks)
        {
            if (!trick.WinnerId.HasValue) continue;

            var winnerId = trick.WinnerId.Value;

            switch (round.RoundType)
            {
                case GameRoundType.AvoidTricks:
                    scores[winnerId] += round.PointsPerTrick; // -2 per trick
                    break;

                case GameRoundType.AvoidHearts:
                    var heartCount = trick.Cards.Count(c => c.Card.IsHeart());
                    scores[winnerId] += heartCount * round.PointsPerHeart; // -2 per Heart
                    break;

                case GameRoundType.AvoidBoys:
                    var boyCount = trick.Cards.Count(c => c.Card.IsBoy());
                    scores[winnerId] += boyCount * round.PointsPerBoy; // -2 per Boy
                    break;

                case GameRoundType.AvoidQueens:
                    var queenCount = trick.Cards.Count(c => c.Card.IsQueen());
                    scores[winnerId] += queenCount * round.PointsPerQueen; // -4 per Queen
                    break;

                case GameRoundType.AvoidLastTwoTricks:
                    if (trick.TrickNumber >= 7) // Last 2 tricks (7th and 8th)
                    {
                        scores[winnerId] += round.PointsPerLastTrick; // -8 per last trick
                    }
                    break;

                case GameRoundType.AvoidKingOfHearts:
                    var hasKingOfHearts = trick.Cards.Any(c => c.Card.IsKingOfHearts);
                    if (hasKingOfHearts)
                    {
                        scores[winnerId] += round.PointsForKingOfHearts; // -16
                    }
                    break;

                case GameRoundType.AvoidEverything:
                    // Combination of all penalties
                    scores[winnerId] += round.PointsPerTrick; // -2 per trick

                    var hearts = trick.Cards.Count(c => c.Card.IsHeart());
                    scores[winnerId] += hearts * round.PointsPerHeart; // -2 per Heart

                    var boys = trick.Cards.Count(c => c.Card.IsBoy());
                    scores[winnerId] += boys * round.PointsPerBoy; // -2 per Boy

                    var queens = trick.Cards.Count(c => c.Card.IsQueen());
                    scores[winnerId] += queens * round.PointsPerQueen; // -4 per Queen

                    if (trick.TrickNumber >= 7) // Last 2 tricks
                    {
                        scores[winnerId] += round.PointsPerLastTrick; // -8 per last trick
                    }

                    var kingOfHearts = trick.Cards.Any(c => c.Card.IsKingOfHearts);
                    if (kingOfHearts)
                    {
                        scores[winnerId] += round.PointsForKingOfHearts; // -16
                    }
                    break;
            }
        }

        return scores;
    }

    public static bool ShouldEndRoundEarly(KingMatch match, GameRound round)
    {
        if (!round.CanEndEarly) return false;

        return round.RoundType switch
        {
            GameRoundType.AvoidTricks => match.CompletedTricks.Count == 8, // All tricks taken
            GameRoundType.AvoidHearts => CountTotalHearts(match) == 8, // All Hearts taken (8 in 32-card deck)
            GameRoundType.AvoidBoys => CountTotalBoys(match) == 8, // All Boys taken (4 Jacks + 4 Kings)
            GameRoundType.AvoidQueens => CountTotalQueens(match) == 4, // All Queens taken
            GameRoundType.AvoidKingOfHearts => HasKingOfHeartsBeenTaken(match), // King of Hearts taken
            _ => false
        };
    }

    private static int CountTotalHearts(KingMatch match)
    {
        return match.CompletedTricks.SelectMany(t => t.Cards).Count(c => c.Card.IsHeart());
    }

    private static int CountTotalBoys(KingMatch match)
    {
        return match.CompletedTricks.SelectMany(t => t.Cards).Count(c => c.Card.IsBoy());
    }

    private static int CountTotalQueens(KingMatch match)
    {
        return match.CompletedTricks.SelectMany(t => t.Cards).Count(c => c.Card.IsQueen());
    }

    private static bool HasKingOfHeartsBeenTaken(KingMatch match)
    {
        return match.CompletedTricks.SelectMany(t => t.Cards).Any(c => c.Card.IsKingOfHearts);
    }
}
