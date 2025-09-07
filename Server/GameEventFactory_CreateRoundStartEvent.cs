// GameEventFactory_CreateRoundStartEvent.cs
namespace BelieveOrNot.Server;

public static partial class GameEventFactory
{
    public static GameEventDto CreateRoundStartEvent(int roundNumber, List<string> disposalMessages)
    {
        var displayMessage = $"🎯 Round {MessageFormatter.FormatCount(roundNumber)} started!";
        if (disposalMessages.Any())
        {
            displayMessage += " " + string.Join(" ", disposalMessages);
        }

        return new GameEventDto
        {
            Type = "RoundStart",
            DisplayMessage = displayMessage,
            Data = new { RoundNumber = roundNumber, Disposals = disposalMessages }
        };
    }
}
