// King/CardExtensions.cs
namespace BelieveOrNot.Server.King;

public static class CardExtensions
{
    public static Suit GetSuit(this Card card)
    {
        return Enum.Parse<Suit>(card.Suit);
    }

    public static Rank GetRank(this Card card)
    {
        return RankExtensions.FromDisplayString(card.Rank) ?? Rank.Two;
    }

    public static bool IsHeart(this Card card)
    {
        return card.Suit == "Hearts";
    }

    public static bool IsBoy(this Card card)
    {
        return card.Rank == "J" || card.Rank == "K";
    }

    public static bool IsQueen(this Card card)
    {
        return card.Rank == "Q";
    }

    public static bool CanFollow(this Card card, Suit leadSuit)
    {
        return card.GetSuit() == leadSuit;
    }
}
