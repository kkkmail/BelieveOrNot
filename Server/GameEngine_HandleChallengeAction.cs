// Server/GameEngine_HandleChallengeAction.cs
namespace BelieveOrNot.Server;

public partial class GameEngine
{
    private GameEventDto HandleChallengeAction(Match match, Player challenger, SubmitMoveRequest request)
    {
        var cardIndex = match.TablePile.Count - match.LastPlayCardCount + request.ChallengePickIndex!.Value;
        var revealedCard = match.TablePile[cardIndex];

        var prevPlayerIndex = (match.CurrentPlayerIndex - 1 + match.Players.Count) % match.Players.Count;
        var challengedPlayer = match.Players[prevPlayerIndex];

        bool isMatch = revealedCard.Rank == match.AnnouncedRank || revealedCard.IsJoker;
        bool challengerWasRight = !isMatch;

        // Determine who collects the cards
        Player collector = challengerWasRight ? challengedPlayer : challenger;

        var collectedCount = match.TablePile.Count;

        // FIXED: Store the announced rank, last play count, AND table cards BEFORE clearing them
        var currentAnnouncedRank = match.AnnouncedRank ?? "Unknown";
        var currentLastPlayCount = match.LastPlayCardCount;
        var allTableCards = new List<Card>(match.TablePile); // Copy before clearing

        collector.Hand.AddRange(match.TablePile);
        match.TablePile.Clear();
        match.AnnouncedRank = null;
        match.LastPlayCardCount = 0;

        // Handle automatic disposal
        var disposalEvents = AutoDisposeFourOfAKind(collector, match);

        // Set current player to the collector
        var collectorIndex = match.Players.IndexOf(collector);
        match.CurrentPlayerIndex = collectorIndex;

        // FIXED: Pass all table cards to include remaining cards data
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
            allTableCards // NEW: Pass all table cards for remaining cards extraction
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