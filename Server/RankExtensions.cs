namespace BelieveOrNot.Server;

public static class RankExtensions
{
    public static string ToDisplayString(this Rank rank)
    {
        return rank switch
        {
            Rank.Two => "2",
            Rank.Three => "3",
            Rank.Four => "4",
            Rank.Five => "5",
            Rank.Six => "6",
            Rank.Seven => "7",
            Rank.Eight => "8",
            Rank.Nine => "9",
            Rank.Ten => "10",
            Rank.Jack => "J",
            Rank.Queen => "Q",
            Rank.King => "K",
            Rank.Ace => "A",
            Rank.Joker => "Joker",
            _ => rank.ToString()
        };
    }

    public static Rank? FromDisplayString(string displayString)
    {
        return displayString switch
        {
            "2" => Rank.Two,
            "3" => Rank.Three,
            "4" => Rank.Four,
            "5" => Rank.Five,
            "6" => Rank.Six,
            "7" => Rank.Seven,
            "8" => Rank.Eight,
            "9" => Rank.Nine,
            "10" => Rank.Ten,
            "J" => Rank.Jack,
            "Q" => Rank.Queen,
            "K" => Rank.King,
            "A" => Rank.Ace,
            "Joker" => Rank.Joker,
            _ => null
        };
    }

    public static Rank[] GetRanksForDeckSize(DeckSize deckSize)
    {
        return deckSize switch
        {
            DeckSize.Small => new[] { Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King, Rank.Ace },
            DeckSize.Medium => new[] { Rank.Six, Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King, Rank.Ace },
            DeckSize.Full => new[] { Rank.Two, Rank.Three, Rank.Four, Rank.Five, Rank.Six, Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King, Rank.Ace },
            _ => throw new ArgumentException($"Unsupported deck size: {deckSize}")
        };
    }
}