// Server/King/KingHub_ReconnectToMatch.cs
namespace BelieveOrNot.Server.King;

public partial class KingHub
{
    public async Task<KingReconnectionResponse> ReconnectToMatch(string matchIdString, string clientId)
    {
        if (!Guid.TryParse(matchIdString, out var matchId))
        {
            return new KingReconnectionResponse
            {
                Success = false,
                Message = "Invalid match ID format."
            };
        }

        var match = _matchManager.GetMatch(matchId);
        if (match == null)
        {
            return new KingReconnectionResponse
            {
                Success = false,
                Message = "The King game you were trying to rejoin no longer exists or has ended."
            };
        }

        var player = match.Players.FirstOrDefault(p => p.ClientId == clientId);
        if (player == null)
        {
            if (match.Phase != GamePhase.WaitingForPlayers)
            {
                return new KingReconnectionResponse
                {
                    Success = false,
                    Message = "This King game has already started and new players cannot join."
                };
            }

            return new KingReconnectionResponse
            {
                Success = false,
                Message = "You were not found in this King game."
            };
        }

        player.IsConnected = true;
        player.LastSeen = DateTime.UtcNow;

        await Groups.AddToGroupAsync(Context.ConnectionId, $"kingmatch:{matchId}");
        _connectionToPlayer[Context.ConnectionId] = (matchId, player.Id);

        await BroadcastPersonalizedStates(match);

        return new KingReconnectionResponse
        {
            Success = true,
            Message = "Successfully reconnected to King game!",
            Match = match,
            GameState = _gameEngine.CreateGameStateDtoForPlayer(match, player.Id),
            PlayerId = player.Id
        };
    }
}