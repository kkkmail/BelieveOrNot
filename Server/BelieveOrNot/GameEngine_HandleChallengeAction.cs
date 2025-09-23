// BelieveOrNot/GameEngine_HandleChallengeAction.cs
namespace BelieveOrNot.Server.BelieveOrNot;

public partial class GameEngine
{
    private GameEventDto HandleChallengeAction(Match match, Player challenger, SubmitMoveRequest request)
    {
        var cardIndex = match.TablePile.Count - match.LastPlayCardCount + request.ChallengePickIndex!.Value;
        var revealedCard = match.TablePile[cardIndex];

        // var prevPlayerIndex = (match.CurrentPlayerIndex - 1 + match.Players.Count) % match.Players.Count;
        // var challengedPlayer = match.Players[prevPlayerIndex];

        var challengedPlayerIndex =
            match.LastActualPlayerIndex
            ?? ((match.CurrentPlayerIndex - 1 + match.Players.Count) % match.Players.Count);

        var challengedPlayer = match.Players[challengedPlayerIndex];

        var isMatch = revealedCard.Rank == match.AnnouncedRank || revealedCard.IsJoker;
        var challengerWasRight = !isMatch;

        // Determine who collects the cards
        var collector = challengerWasRight ? challengedPlayer : challenger;

        var collectedCount = match.TablePile.Count;

        // FIXED: Store the announced rank, last play count, AND table cards BEFORE clearing them
        var currentAnnouncedRank = match.AnnouncedRank ?? "Unknown";
        var currentLastPlayCount = match.LastPlayCardCount;
        var allTableCards = new List<Card>(match.TablePile); // Copy before clearing

        collector.Hand.AddRange(match.TablePile);
        match.TablePile.Clear();
        match.AnnouncedRank = null;
        match.LastPlayCardCount = 0;
        match.LastActualPlayerIndex = null;

        // Handle automatic disposal
        var disposalEvents = AutoDisposeFourOfAKind(collector, match);

        // Set current player to the collector
        var collectorIndex = match.Players.IndexOf(collector);
        match.CurrentPlayerIndex = collectorIndex;

        // FIXED: Calculate remaining cards and their match status for animation
        List<Card> remainingCards = new();
        List<bool> remainingCardsMatch = new();

        if (isMatch && collector == challenger) // Challenger collects when challenged card matches
        {
            var lastPlayCards = allTableCards
                .Skip(allTableCards.Count - currentLastPlayCount)
                .ToList();

            remainingCards = new List<Card>();
            remainingCardsMatch = new List<bool>();

            for (int i = 0; i < lastPlayCards.Count; i++)
            {
                if (i != request.ChallengePickIndex!.Value) // Exclude the challenged card
                {
                    var card = lastPlayCards[i];
                    remainingCards.Add(card);
                    // Check if this remaining card matches the announced rank
                    bool cardMatches = card.Rank == currentAnnouncedRank || card.IsJoker;
                    remainingCardsMatch.Add(cardMatches);
                }
            }
        }

        var challengeEvent = GameEventFactory.CreateChallengeEvent(
            challenger.Name,
            challengedPlayer.Name,
            request.ChallengePickIndex!.Value,
            currentLastPlayCount,
            revealedCard,
            currentAnnouncedRank,
            isMatch,
            collector.Name,
            collectedCount,
            allTableCards,
            remainingCards,
            remainingCardsMatch
        );

        // Add disposal messages if any occurred
        if (disposalEvents.Any())
        {
            var disposalMessages = disposalEvents.Select(rank =>
                GameEventFactory.CreateDisposalEvent(collector.Name, rank).DisplayMessage);
            challengeEvent.DisplayMessage += " " + string.Join(" ", disposalMessages);
        }

        // Check if round should end
        var playersWithNoCards = match.Players.Where(p => p.Hand.Count == 0).ToList();
        if (playersWithNoCards.Any())
        {
            EndRound(match);
        }
        else
        {
            AdvanceToNextActivePlayer(match);
        }

        return challengeEvent;
    }
}
