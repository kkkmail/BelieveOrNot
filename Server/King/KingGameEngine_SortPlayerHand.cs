// Server/King/KingGameEngine_DealCards.cs
namespace BelieveOrNot.Server.King;

public partial class KingGameEngine
{
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
