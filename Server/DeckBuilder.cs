// DeckBuilder.cs
namespace BelieveOrNot.Server;

public static class DeckBuilder
{
    private static readonly Suit[] Suits = Enum.GetValues<Suit>();

    public static List<Card> BuildDeck(DeckSize deckSize, int jokerCount)
    {
        var cards = new List<Card>();

        // Add regular cards based on deck size
        var ranks = RankExtensions.GetRanksForDeckSize(deckSize);

        foreach (var suit in Suits)
        {
            foreach (var rank in ranks)
            {
                cards.Add(new Card(rank.ToDisplayString(), suit.ToString()));
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
