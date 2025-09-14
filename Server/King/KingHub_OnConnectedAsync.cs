// Server/King/KingHub_OnConnectedAsync.cs
namespace BelieveOrNot.Server.King;

public partial class KingHub
{
    public override async Task OnConnectedAsync()
    {
        // Console.WriteLine($"{nameof(KingHub)}.{nameof(OnConnectedAsync)} - Context.ConnectionId: {Context.ConnectionId}");
        await base.OnConnectedAsync();
    }
}
