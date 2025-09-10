// Server/King/KingHub_OnDisconnectedAsync.cs
namespace BelieveOrNot.Server.King;

public partial class KingHub
{
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        Console.WriteLine($"King client disconnected: {Context.ConnectionId}");

        if (_connectionToPlayer.TryRemove(Context.ConnectionId, out var connectionInfo))
        {
            var match = _matchManager.GetMatch(connectionInfo.MatchId);
            if (match != null)
            {
                var player = match.Players.FirstOrDefault(p => p.Id == connectionInfo.PlayerId);
                if (player != null)
                {
                    player.IsConnected = false;
                    player.LastSeen = DateTime.UtcNow;

                    await BroadcastPersonalizedStates(match);
                }
            }
        }

        await base.OnDisconnectedAsync(exception);
    }
}