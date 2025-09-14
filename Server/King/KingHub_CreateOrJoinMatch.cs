// Server/King/KingHub_CreateOrJoinMatch.cs
namespace BelieveOrNot.Server.King;

public partial class KingHub
{
    public async Task<KingGameStateDto> CreateOrJoinMatch(KingCreateMatchRequest request)
    {
        // Console.WriteLine($"{nameof(KingHub)}.{nameof(CreateOrJoinMatch)} - playerName: {request.PlayerName}, Context.ConnectionId: {Context.ConnectionId}");

        try
        {
            var match = _matchManager.CreateMatch(request.PlayerName, request.Settings, request.ClientId ?? string.Empty);
            await Groups.AddToGroupAsync(Context.ConnectionId, $"kingmatch:{match.Id}");

            _connectionToPlayer[Context.ConnectionId] = (match.Id, match.Players[0].Id);
            // Console.WriteLine($"{nameof(KingHub)}.{nameof(CreateOrJoinMatch)} - Added connection mapping: {Context.ConnectionId} -> {match.Players[0].Id}");
            // var allConnections = _connectionToPlayer.ToArray();
            //
            // foreach (var connection in allConnections)
            // {
            //     Console.WriteLine($"{nameof(KingHub)}.{nameof(CreateOrJoinMatch)} - match.Id: {match.Id}, connection.Key: {connection.Key}, connection.Value: (MatchId: {connection.Value.MatchId}, PlayerId: {connection.Value.PlayerId})");
            // }

            var state = _gameEngine.CreateGameStateDto(match);
            await Clients.Group($"kingmatch:{match.Id}").SendAsync("StateUpdate", state);

            // Console.WriteLine($"{nameof(KingHub)}.{nameof(CreateOrJoinMatch)} - Successfully created match: {match} and sent StateUpdate, state: {state}");
            return state;
        }
        catch(Exception ex)
        {
            Console.WriteLine($"{nameof(KingHub)}.{nameof(CreateOrJoinMatch)} - Exception: {ex.Message}");
            throw new HubException("Failed to create King match");
        }
    }
}
