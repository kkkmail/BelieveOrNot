// Server/King/KingHub_BroadcastPersonalizedStates.cs
namespace BelieveOrNot.Server.King;

public partial class KingHub
{
    private async Task BroadcastPersonalizedStates(KingMatch match)
    {
        // Console.WriteLine($"{nameof(KingHub)}.{nameof(BroadcastPersonalizedStates)} - match: {match}");

        // var allConnections = PlayerToConnection.ToArray();
        //
        // foreach (var connection in allConnections)
        // {
        //     Console.WriteLine($"{nameof(KingHub)}.{nameof(BroadcastPersonalizedStates)} - match.Id: {match.Id}, connection.Key: {connection.Key}, connection.Value: (MatchId: {connection.Value.MatchId}, PlayerId: {connection.Value.PlayerId})");
        // }

        var tasks = PlayerToConnection
            .Where(kvp => kvp.Value.MatchId == match.Id)
            .Select(async kvp =>
            {
                var playerId = kvp.Key;
                var connectionId = kvp.Value.ConnectionId;

                var playerState = _gameEngine.CreateGameStateDtoForPlayer(match, playerId);
                // Console.WriteLine($"{nameof(KingHub)}.{nameof(BroadcastPersonalizedStates)} - playerId: {playerId}, playerState: {playerState}");
                await Clients.Client(connectionId).SendAsync("StateUpdate", playerState);
            });

        await Task.WhenAll(tasks);
    }
}
