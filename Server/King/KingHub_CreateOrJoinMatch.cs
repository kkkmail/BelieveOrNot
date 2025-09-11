// Server/King/KingHub_CreateOrJoinMatch.cs
namespace BelieveOrNot.Server.King;

public partial class KingHub
{
    public async Task<KingGameStateDto> CreateOrJoinMatch(KingCreateMatchRequest request)
    {
        try
        {
            var match = _matchManager.CreateMatch(request.PlayerName, request.Settings, request.ClientId ?? string.Empty);
            await Groups.AddToGroupAsync(Context.ConnectionId, $"kingmatch:{match.Id}");

            _connectionToPlayer[Context.ConnectionId] = (match.Id, match.Players[0].Id);

            var state = _gameEngine.CreateGameStateDto(match);
            await Clients.Group($"kingmatch:{match.Id}").SendAsync("StateUpdate", state);

            return state;
        }
        catch
        {
            throw new HubException("Failed to create King match");
        }
    }
}