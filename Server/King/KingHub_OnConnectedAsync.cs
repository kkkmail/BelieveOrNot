// Server/King/KingHub_OnConnectedAsync.cs
namespace BelieveOrNot.Server.King;

public partial class KingHub
{
    public override async Task OnConnectedAsync()
    {
        Console.WriteLine($"King client connected: {Context.ConnectionId}");
        await base.OnConnectedAsync();
    }
}