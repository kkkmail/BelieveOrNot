// BelieveOrNot/GameEngine_IsValidPlayAction.cs
namespace BelieveOrNot.Server.BelieveOrNot;

public partial class GameEngine
{
    private bool IsValidPlayAction(Match match, Player player, SubmitMoveRequest request)
    {
        if (player.Hand.Count == 0) return false;

        var currentPlayer = match.Players[match.CurrentPlayerIndex];
        if (currentPlayer.Id != player.Id) return false;

        // Check if only one active player remains
        var activePlayers = match.Players.Where(p => p.Hand.Count > 0).ToList();
        var playersWithNoCards = match.Players.Where(p => p.Hand.Count == 0).ToList();

        if (activePlayers.Count == 1 && playersWithNoCards.Any())
        {
            Console.WriteLine($"VALIDATION: Only 1 active player remaining ({player.Name}) - blocking play");
            return false;
        }

        if (request.Cards == null || request.Cards.Count < 1 || request.Cards.Count > 3)
            return false;

        // Verify player has the requested cards
        var playerCardCounts = new Dictionary<(string rank, string suit), int>();
        foreach (var card in player.Hand)
        {
            var key = (card.Rank, card.Suit);
            playerCardCounts[key] = playerCardCounts.GetValueOrDefault(key, 0) + 1;
        }

        var requestedCardCounts = new Dictionary<(string rank, string suit), int>();
        foreach (var card in request.Cards)
        {
            var key = (card.Rank, card.Suit);
            requestedCardCounts[key] = requestedCardCounts.GetValueOrDefault(key, 0) + 1;
        }

        foreach (var kvp in requestedCardCounts)
        {
            if (!playerCardCounts.ContainsKey(kvp.Key) ||
                playerCardCounts[kvp.Key] < kvp.Value)
            {
                return false;
            }
        }

        // For opening turn, declared rank must be provided
        if (match.AnnouncedRank == null)
        {
            return !string.IsNullOrEmpty(request.DeclaredRank);
        }

        return true;
    }
}
