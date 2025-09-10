// Server/King/KingGameEngine_DealCards.cs
namespace BelieveOrNot.Server.King;

public partial class KingGameEngine
{
    private void DealCards(KingMatch match)
    {
        // Clear all hands
        foreach (var player in match.Players)
        {
            player.Hand.Clear();
        }

        // Build and shuffle deck (32 cards for King game)
        var deck = DeckBuilder.BuildDeck(DeckSize.Small);
        DeckBuilder.Shuffle(deck, _random);

        // Deal 8 cards to each player
        for (int i = 0; i < deck.Count; i++)
        {
            var playerIndex = i % 4;
            match.Players[playerIndex].Hand.Add(deck[i]);
        }

        // Sort each player's hand after dealing
        foreach (var player in match.Players)
        {
            SortPlayerHand(player);
        }
    }

    private void SortPlayerHand(Player player)
    {
        // Sort by suit first (using enum order: Spades, Clubs, Diamonds, Hearts)
        // Then by rank (7, 8, 9, 10, J, Q, K, A)
        player.Hand = player.Hand
            .OrderBy(c => c.GetSuit())
            .ThenBy(c => c.GetRank())
            .ToList();
    }
}