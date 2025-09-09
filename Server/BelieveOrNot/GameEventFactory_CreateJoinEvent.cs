// BelieveOrNot/GameEventFactory_CreateJoinEvent.cs
namespace BelieveOrNot.Server.BelieveOrNot;

public static partial class GameEventFactory
{
    public static GameEventDto CreateJoinEvent(string playerName, bool isCreator)
    {
        var data = new JoinEventData
        {
            PlayerName = playerName,
            IsCreator = isCreator
        };

        return new GameEventDto
        {
            Type = "Join",
            DisplayMessage = MessageFormatter.JoinEvent(playerName, isCreator),
            Data = data
        };
    }
}
