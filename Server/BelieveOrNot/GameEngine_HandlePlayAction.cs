// BelieveOrNot/GameEngine_HandlePlayAction.cs
namespace BelieveOrNot.Server.BelieveOrNot;

public partial class GameEngine
{
    private GameEventDto HandlePlayAction(Match match, Player player, SubmitMoveRequest request)
    {
        // Remove cards from player's hand
        var cardsToRemove = new List<Card>();
        foreach (var requestedCard in request.Cards!)
        {
            var cardInHand = player.Hand.FirstOrDefault(c =>
                c.Rank == requestedCard.Rank && c.Suit == requestedCard.Suit);
            if (cardInHand != null)
            {
                cardsToRemove.Add(cardInHand);
            }
        }

        foreach (var card in cardsToRemove)
        {
            player.Hand.Remove(card);
        }

        // Add cards to table pile
        match.TablePile.AddRange(request.Cards!);
        match.LastPlayCardCount = request.Cards!.Count;

        // Set announced rank if this is the opening play
        if (match.AnnouncedRank == null)
        {
            match.AnnouncedRank = request.DeclaredRank;
        }

        // Handle automatic disposal of four-of-a-kind
        var disposalEvents = AutoDisposeFourOfAKind(player, match);

        var cardPlayEvent = GameEventFactory.CreateCardPlayEvent(
            player.Name,
            request.Cards!,
            match.AnnouncedRank!,
            player.Hand.Count
        );

        // Add disposal messages if any occurred
        if (disposalEvents.Any())
        {
            var disposalMessages = disposalEvents.Select(rank =>
                GameEventFactory.CreateDisposalEvent(player.Name, rank).DisplayMessage);
            cardPlayEvent.DisplayMessage += " " + string.Join(" ", disposalMessages);
        }

        // Store who actually played these cards
        match.LastActualPlayerIndex = match.Players.IndexOf(player);

        AdvanceToNextActivePlayer(match);
        return cardPlayEvent;
    }
}
