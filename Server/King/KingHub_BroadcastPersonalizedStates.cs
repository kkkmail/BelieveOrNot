// Server/King/KingHub_BroadcastPersonalizedStates.cs
namespace BelieveOrNot.Server.King;

public partial class KingHub
{
    private async Task BroadcastPersonalizedStates(KingMatch match)
    {
        var tasks = _connectionToPlayer
            .Where(kvp => kvp.Value.MatchId == match.Id)
            .Select(async kvp =>
            {
                var connectionId = kvp.Key;
                var playerId = kvp.Value.PlayerId;

                var playerState = _gameEngine.CreateGameStateDtoForPlayer(match, playerId);
                await Clients.Client(connectionId).SendAsync("StateUpdate", playerState);
            });

        await Task.WhenAll(tasks);
    }
}