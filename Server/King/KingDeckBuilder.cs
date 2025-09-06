// Server/King/KingDeckBuilder.cs
namespace BelieveOrNot.Server.King;

public static class KingDeckBuilder
{
    private static readonly KingSuit[] Suits = { KingSuit.Hearts, KingSuit.Diamonds, KingSuit.Clubs, KingSuit.Spades };
    private static readonly KingRank[] Ranks = { 
        KingRank.Seven, KingRank.Eight, KingRank.Nine, KingRank.Ten, 
        KingRank.Jack, KingRank.Queen, KingRank.King, KingRank.Ace 
    };
    
    public static List<KingCard> BuildDeck()
    {
        var cards = new List<KingCard>();
        
        foreach (var suit in Suits)
        {
            foreach (var rank in Ranks)
            {
                cards.Add(new KingCard(rank, suit));
            }
        }
        
        return cards;
    }
    
    public static void Shuffle(List<KingCard> deck, Random? random = null)
    {
        random ??= new Random();
        for (int i = deck.Count - 1; i > 0; i--)
        {
            int j = random.Next(i + 1);
            (deck[i], deck[j]) = (deck[j], deck[i]);
        }
    }
    
    public static void DealCards(List<KingCard> deck, List<KingPlayer> players)
    {
        // Clear all hands
        foreach (var player in players)
        {
            player.Hand.Clear();
        }
        
        // Deal 8 cards to each player
        for (int cardIndex = 0; cardIndex < deck.Count; cardIndex++)
        {
            var playerIndex = cardIndex % 4;
            players[playerIndex].Hand.Add(deck[cardIndex]);
        }
        
        // Sort each player's hand
        foreach (var player in players)
        {
            player.Hand.Sort((a, b) => 
            {
                if (a.Suit != b.Suit)
                    return a.Suit.CompareTo(b.Suit);
                return a.Rank.CompareTo(b.Rank);
            });
        }
    }
}