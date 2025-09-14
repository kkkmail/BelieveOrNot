// Server/King/KingHub_OnDisconnectedAsync.cs
namespace BelieveOrNot.Server.King;

public partial class KingHub
{
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        // Console.WriteLine($"{nameof(KingHub)}.{nameof(OnDisconnectedAsync)} - Context.ConnectionId: {Context.ConnectionId}");

        if (_connectionToPlayer.TryRemove(Context.ConnectionId, out var connectionInfo))
        {
            // Console.WriteLine($"{nameof(KingHub)}.{nameof(OnDisconnectedAsync)} - Removed connection mapping for {Context.ConnectionId}, connectionInfo: {connectionInfo}");
            // var allConnections = _connectionToPlayer.ToArray();
            //
            // foreach (var connection in allConnections)
            // {
            //     Console.WriteLine($"{nameof(KingHub)}.{nameof(OnDisconnectedAsync)} - connection.Key: {connection.Key}, connection.Value: (MatchId: {connection.Value.MatchId}, PlayerId: {connection.Value.PlayerId})");
            // }

            var match = _matchManager.GetMatch(connectionInfo.MatchId);
            if (match != null)
            {
                var player = match.Players.FirstOrDefault(p => p.Id == connectionInfo.PlayerId);
                if (player != null)
                {
                    player.IsConnected = false;
                    player.LastSeen = DateTime.UtcNow;
                    // Console.WriteLine($"{nameof(KingHub)}.{nameof(OnDisconnectedAsync)} - Marked player {player.Name} as disconnected");

                    await BroadcastPersonalizedStates(match);
                }
            }
        }

        await base.OnDisconnectedAsync(exception);
    }
}
