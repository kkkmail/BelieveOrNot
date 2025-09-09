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
        return IsValidFollow(player, card, currentTrick);
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

    private static bool IsValidFollow(Player player, Card card, Trick trick)
    {
        var leadSuit = trick.LedSuit;
        if (leadSuit == null) return true;

        // Must follow suit if possible
        var sameSuitCards = player.Hand.Where(c => c.GetSuit() == leadSuit.Value).ToList();
        if (sameSuitCards.Any())
        {
            return card.GetSuit() == leadSuit.Value;
        }

        // No cards of lead suit - can play any card
        return true;
    }

    public static bool MustDiscardKingOfHearts(Player player, Trick trick, GameRound round)
    {
        if (!round.MustDiscardKingOfHearts) return false;
        if (trick.Cards.Count == 0) return false; // Leading, not discarding

        var kingOfHearts = player.Hand.FirstOrDefault(c => c.IsKingOfHearts);
        if (kingOfHearts == null) return false;

        var leadSuit = trick.LedSuit!.Value;
        var sameSuitCards = player.Hand.Where(c => c.GetSuit() == leadSuit).ToList();

        // Must discard King of Hearts if cannot follow suit
        return !sameSuitCards.Any();
    }

    public static bool IsValidTrumpSelection(KingMatch match, Player player, Suit trumpSuit)
    {
        if (!match.WaitingForTrumpSelection) return false;
        if (match.CurrentRound?.TrumpChooser != player.Id) return false;

        return true;
    }
}