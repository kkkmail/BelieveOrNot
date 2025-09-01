using BelieveOrNot.Shared;
using System.Linq;
using System.Security.Cryptography;

namespace BelieveOrNot.Rules;

public static class DeckBuilder
{
    public static System.Collections.Generic.List<Card> Build(int deckSize, int jokers)
    {
        var deck = deckSize switch
        {
            32 => Ranks32().SelectMany(r => SuitsAll().Select(s => new Card(r, s))).ToList(),
            36 => Ranks36().SelectMany(r => SuitsAll().Select(s => new Card(r, s))).ToList(),
            54 => Ranks54().SelectMany(r => SuitsAll().Select(s => new Card(r, s))).ToList(),
            _  => throw new ArgumentOutOfRangeException(nameof(deckSize))
        };

        deck.AddRange(Enumerable.Repeat(new Card(Rank.Joker, Suit.None), jokers));
        return deck;
    }

    public static void ShuffleInPlace(System.Collections.Generic.List<Card> deck, ReadOnlySpan<byte> seed)
    {
        using var hmac = new HMACSHA256(seed.ToArray());
        for (int i = deck.Count - 1; i > 0; i--)
        {
            var bytes = hmac.ComputeHash(BitConverter.GetBytes(i));
            var rnd = BitConverter.ToUInt32(bytes, 0);
            var j = (int)(rnd % (uint)(i + 1));
            (deck[i], deck[j]) = (deck[j], deck[i]);
        }
    }

    private static IEnumerable<Rank> Ranks32()
        => new[] { Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King, Rank.Ace };

    private static IEnumerable<Rank> Ranks36()
        => new[] { Rank.Six, Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King, Rank.Ace };

    private static IEnumerable<Rank> Ranks54()
        => new[] { Rank.Two, Rank.Three, Rank.Four, Rank.Five, Rank.Six, Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King, Rank.Ace };

    private static IEnumerable<Suit> SuitsAll()
        => new[] { Suit.Clubs, Suit.Diamonds, Suit.Hearts, Suit.Spades };
}
