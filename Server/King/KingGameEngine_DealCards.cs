// Server/King/KingGameEngine_DealCards.cs
namespace BelieveOrNot.Server.King;

public partial class KingGameEngine
{
    private void DealCards(KingMatch match)
    {
        // Clear all hands and trump selection cards
        foreach (var player in match.Players)
        {
            player.Hand.Clear();
            player.TrumSelectionCards?.Clear();
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

        // Store the first 3 cards of each player before sorting.
        AssignTrumpCards(match, 3);

        // Sort each player's hand after dealing
        foreach (var player in match.Players)
        {
            SortPlayerHand(player);
        }
    }
}
