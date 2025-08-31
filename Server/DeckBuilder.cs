public static class DeckBuilder
{
    private static readonly string[] Suits = { "Hearts", "Diamonds", "Clubs", "Spades" };
    
    public static List<Card> BuildDeck(int deckSize, int jokerCount)
    {
        var cards = new List<Card>();
        
        // Add regular cards based on deck size
        var ranks = deckSize switch
        {
            32 => new[] { "7", "8", "9", "10", "J", "Q", "K", "A" },
            36 => new[] { "6", "7", "8", "9", "10", "J", "Q", "K", "A" },
            52 => new[] { "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A" },
            _ => throw new ArgumentException($"Unsupported deck size: {deckSize}")
        };
        
        foreach (var suit in Suits)
        {
            foreach (var rank in ranks)
            {
                cards.Add(new Card(rank, suit));
            }
        }
        
        // Add jokers
        for (int i = 0; i < jokerCount; i++)
        {
            cards.Add(new Card("Joker", "Joker"));
        }
        
        return cards;
    }
    
    public static void Shuffle(List<Card> deck, Random? random = null)
    {
        random ??= new Random();
        for (int i = deck.Count - 1; i > 0; i--)
        {
            int j = random.Next(i + 1);
            (deck[i], deck[j]) = (deck[j], deck[i]);
        }
    }
}