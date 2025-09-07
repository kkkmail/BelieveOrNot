// GameEventFactory_CreateConnectionEvent.cs
namespace BelieveOrNot.Server.BelieveOrNot;

public static partial class GameEventFactory
{
    public static GameEventDto CreateConnectionEvent(string playerName, bool connected)
    {
        var data = new ConnectionEventData
        {
            PlayerName = playerName,
            IsConnected = connected
        };

        return new GameEventDto
        {
            Type = "Connection",
            DisplayMessage = MessageFormatter.ConnectionEvent(playerName, connected),
            Data = data
        };
    }
}
