// Server/GameEventFactory_CreateChallengeEvent.cs
namespace BelieveOrNot.Server;

public static partial class GameEventFactory
{
    public static GameEventDto CreateChallengeEvent(string challenger, string challenged, int cardIndex, int totalCards, Card revealedCard, string announcedRank, bool cardMatches, string collector, int cardsCollected, List<Card> allTableCards)
    {
        // Get remaining cards (excluding the revealed one) for challenger animation
        List<Card>? remainingCards = null;
        if (cardMatches && collector == challenger) // Challenger collects when card matches
        {
            remainingCards = allTableCards
                .Skip(allTableCards.Count - totalCards) // Get last play cards
                .Where((card, index) => index != cardIndex) // Exclude revealed card
                .ToList();
        }

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
            RemainingCards = remainingCards
        };

        // Create the display message with correct logic
        var challengeDetails = MessageFormatter.Challenge(challenger, challenged, cardIndex, totalCards);
        var challengeResult = MessageFormatter.ChallengeResult(revealedCard, announcedRank, challenger, challenged, cardMatches);
        var displayMessage = challengeDetails + " " + challengeResult;

        Console.WriteLine($"DEBUG Challenge Event - CardIndex: {cardIndex}, TotalCards: {totalCards}, AnnouncedRank: '{announcedRank}', CardMatches: {cardMatches}, Collector: {collector}");

        return new GameEventDto
        {
            Type = "Challenge",
            DisplayMessage = displayMessage,
            Data = data
        };
    }
}