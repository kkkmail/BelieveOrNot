// GameEventFactory_CreateChallengeEvent.cs
namespace BelieveOrNot.Server.BelieveOrNot;

public static partial class GameEventFactory
{
    public static GameEventDto CreateChallengeEvent(string challenger, string challenged, int cardIndex, int totalCards, Card revealedCard, string announcedRank, bool cardMatches, string collector, int cardsCollected, List<Card> allTableCards, List<Card>? remainingCards = null, List<bool>? remainingCardsMatch = null)
    {
        var data = new ChallengeEventData
        {
            ChallengerName = challenger,
            ChallengedPlayerName = challenged,
            CardIndex = cardIndex,
            TotalCards = totalCards,
            RevealedCard = revealedCard,
            AnnouncedRank = announcedRank,
            IsMatch = cardMatches,
            CollectorName = collector,
            CardsCollected = cardsCollected,
            RemainingCards = remainingCards,
            RemainingCardsMatch = remainingCardsMatch
        };

        // Create the display message with correct logic
        var challengeDetails = MessageFormatter.Challenge(challenger, challenged, cardIndex, totalCards);
        var challengeResult = MessageFormatter.ChallengeResult(revealedCard, announcedRank, challenger, challenged, cardMatches);
        var displayMessage = challengeDetails + " " + challengeResult;

        Console.WriteLine($"DEBUG Challenge Event - CardIndex: {cardIndex}, TotalCards: {totalCards}, AnnouncedRank: '{announcedRank}', CardMatches: {cardMatches}, Collector: {collector}");
        if (remainingCards != null && remainingCardsMatch != null)
        {
            Console.WriteLine($"DEBUG Remaining Cards: {remainingCards.Count}, Match Status: [{string.Join(", ", remainingCardsMatch)}]");
        }

        return new GameEventDto
        {
            Type = "Challenge",
            DisplayMessage = displayMessage,
            Data = data
        };
    }
}
