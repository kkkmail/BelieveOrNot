// Server/King/KingMoveValidator.cs
namespace BelieveOrNot.Server.King;

public static class KingMoveValidator
{
    public static bool IsValidCardPlay(KingMatch match, Player player, Card card)
    {
        if (match.Phase != GamePhase.InProgress) return false;
        if (match.CurrentPlayer.Id != player.Id) return false;
        if (!player.Hand.Contains(card)) return false;

        var currentRound = match.CurrentRound;
        if (currentRound == null) return false;

        var currentTrick = match.CurrentTrick;
        if (currentTrick == null) return false;

        // If leading the trick
        if (currentTrick.Cards.Count == 0)
        {
            return IsValidLead(match, player, card, currentRound);
        }

        // Following to a trick
        return IsValidFollow(match, player, card, currentTrick, currentRound);
    }

    private static bool IsValidLead(KingMatch match, Player player, Card card, GameRound round)
    {
        // Special rule: Cannot lead Hearts in "Don't take Hearts" round unless no other choice
        if (round.CannotLeadHearts && card.IsHeart())
        {
            var nonHeartCards = player.Hand.Where(c => !c.IsHeart()).ToList();
            if (nonHeartCards.Any())
            {
                return false; // Can't lead Hearts when other suits are available
            }
        }

        return true;
    }

    private static bool IsValidFollow(KingMatch match, Player player, Card card, Trick trick, GameRound round)
    {
        var leadSuit = trick.LedSuit;
        if (leadSuit == null) return true;

        // Must follow suit if possible
        var sameSuitCards = player.Hand.Where(c => c.GetSuit() == leadSuit.Value).ToList();
        if (sameSuitCards.Any())
        {
            return card.GetSuit() == leadSuit.Value;
        }

        // No cards of lead suit - check King of Hearts rule
        if (round.MustDiscardKingOfHearts)
        {
            var kingOfHearts = player.Hand.FirstOrDefault(c => c.IsKingOfHearts);
            if (kingOfHearts != null)
            {
                // Must play King of Hearts when cannot follow suit
                return card.IsKingOfHearts;
            }
        }

        // Collecting Phase Trump Rules: Must place trump if player does not have leading card suit and has trumps on hand
        if (round.IsCollectingPhase && match.SelectedTrumpSuit.HasValue)
        {
            var trumpSuit = match.SelectedTrumpSuit.Value;
            var trumpCards = player.Hand.Where(c => c.GetSuit() == trumpSuit).ToList();

            if (trumpCards.Any())
            {
                // Player has trump cards and cannot follow suit, must play trump
                return card.GetSuit() == trumpSuit;
            }
        }

        // No cards of lead suit and no King of Hearts requirement - can play any card
        return true;
    }

    public static bool IsValidTrumpSelection(KingMatch match, Player player, Suit trumpSuit)
    {
        if (!match.WaitingForTrumpSelection) return false;
        if (match.CurrentRound?.TrumpChooser != player.Id) return false;

        return true;
    }
}
