// Server/GameEventFactory_CreateDisposalEvent.cs
namespace BelieveOrNot.Server;

public static partial class GameEventFactory
{
    public static GameEventDto CreateDisposalEvent(string playerName, string rank)
    {
        var data = new DisposalEventData
        {
            PlayerName = playerName,
            Rank = rank
        };

        return new GameEventDto
        {
            Type = "Disposal",
            DisplayMessage = MessageFormatter.Disposal(playerName, rank),
            Data = data
        };
    }
}