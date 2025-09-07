// Server/Shared/CardExtensions.cs
namespace BelieveOrNot.Server.Shared;

public static class CardExtensions
{
    public static bool IsHeart(this Card card)
    {
        return card.Suit == "Hearts";
    }

    public static bool IsKingOfHearts(this Card card)
    {
        return card.Rank == "King" && card.Suit == "Hearts";
    }

    public static Suit GetSuit(this Card card)
    {
        return card.Suit switch
        {
            "Spades" => Suit.Spades,
            "Clubs" => Suit.Clubs,
            "Diamonds" => Suit.Diamonds,
            "Hearts" => Suit.Hearts,
            _ => throw new InvalidOperationException($"Unknown suit: {card.Suit}")
        };
    }

    public static int GetRank(this Card card)
    {
        return card.Rank switch
        {
            "7" => 7,
            "8" => 8,
            "9" => 9,
            "10" => 10,
            "J" => 11,
            "Q" => 12,
            "K" => 13,
            "A" => 14,
            _ => throw new InvalidOperationException($"Unknown rank: {card.Rank}")
        };
    }
}