// Server/King/Trick.cs
namespace BelieveOrNot.Server.King;

public class Trick
{
    public int TrickNumber { get; set; }
    public List<PlayedCard> Cards { get; set; } = new();
    public Guid? WinnerId { get; set; }
    public Suit? LedSuit { get; set; }
    public bool IsComplete { get; set; } = false; // Changed from computed to get/set property

    public PlayedCard? GetWinningCard(Suit? trumpSuit)
    {
        if (Cards.Count != 4) return null;

        var leadSuit = LedSuit ?? Cards.First().Card.GetSuit();

        // Trump cards win over non-trump
        var trumpCards = Cards.Where(c => trumpSuit.HasValue && c.Card.GetSuit() == trumpSuit.Value).ToList();
        if (trumpCards.Any())
        {
            return trumpCards.OrderByDescending(c => c.Card.GetRank()).First();
        }

        // Highest card of lead suit wins
        var leadSuitCards = Cards.Where(c => c.Card.GetSuit() == leadSuit).ToList();
        return leadSuitCards.OrderByDescending(c => c.Card.GetRank()).First();
    }
}