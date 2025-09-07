// GameEventFactory_CreateCardPlayEvent.cs
namespace BelieveOrNot.Server.BelieveOrNot;

public static partial class GameEventFactory
{
    public static GameEventDto CreateCardPlayEvent(string playerName, List<Card> cards, string declaredRank, int remainingCards)
    {
        var data = new CardPlayEventData
        {
            PlayerName = playerName,
            CardsPlayed = cards,
            DeclaredRank = declaredRank,
            RemainingCards = remainingCards,
            HasNoCardsLeft = remainingCards == 0
        };

        var displayMessage = MessageFormatter.CardPlay(playerName, cards.Count, declaredRank);
        if (remainingCards == 0)
        {
            displayMessage += $" and has {MessageFormatter.FormatCount(0)} CARDS LEFT! Game continues.";
        }

        return new GameEventDto
        {
            Type = "CardPlay",
            DisplayMessage = displayMessage,
            Data = data
        };
    }
}
