// Server/King/KingHub_OnDisconnectedAsync.cs
namespace BelieveOrNot.Server.King;

public partial class KingHub
{
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        // Console.WriteLine($"{nameof(KingHub)}.{nameof(OnDisconnectedAsync)} - Context.ConnectionId: {Context.ConnectionId}");

        var playerEntry = PlayerToConnection.FirstOrDefault(kvp => kvp.Value.ConnectionId == Context.ConnectionId);
        if (playerEntry.Key != Guid.Empty)
        {
            PlayerToConnection.TryRemove(playerEntry.Key, out _);
            var playerId = playerEntry.Key;
            var matchId = playerEntry.Value.MatchId;

            var match = _matchManager.GetMatch(matchId);
            if (match != null)
            {
                var player = match.Players.FirstOrDefault(p => p.Id == playerId);
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
