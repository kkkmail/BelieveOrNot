// BelieveOrNot/GameHub_ReconnectToMatch.cs
namespace BelieveOrNot.Server.BelieveOrNot;

public partial class GameHub
{
    // Reconnection method
    public async Task<ReconnectionResponse> ReconnectToMatch(string matchIdString, string playerIdString)
    {
        if (!Guid.TryParse(matchIdString, out var matchId))
        {
            return new ReconnectionResponse
            {
                Success = false,
                Message = "Invalid match ID format."
            };
        }

        if (!Guid.TryParse(playerIdString, out var playerId))
        {
            return new ReconnectionResponse
            {
                Success = false,
                Message = "Invalid player ID format."
            };
        }

        var match = _matchManager.GetMatch(matchId);
        if (match == null)
        {
            return new ReconnectionResponse
            {
                Success = false,
                Message = "The game you were trying to rejoin no longer exists or has ended."
            };
        }

        var player = match.Players.FirstOrDefault(p => p.Id == playerId);
        if (player == null)
        {
            // Check if game has started and new players can't join
            if (match.Phase != GamePhase.WaitingForPlayers)
            {
                return new ReconnectionResponse
                {
                    Success = false,
                    Message = "This game has already started and new players cannot join."
                };
            }

            return new ReconnectionResponse
            {
                Success = false,
                Message = "You were not found in this game. You can try joining with your name instead."
            };
        }

        // Mark player as connected and update last seen
        player.IsConnected = true;
        player.LastSeen = DateTime.UtcNow;

        // Add to SignalR group
        await Groups.AddToGroupAsync(Context.ConnectionId, $"match:{matchId}");

        // Map connection to player
        PlayerToConnection[player.Id] = (matchId, Context.ConnectionId);

        // Broadcast reconnection event
        var reconnectionEvent = GameEventFactory.CreateConnectionEvent(player.Name, true);
        await Clients.Group($"match:{matchId}").SendAsync("GameEvent", reconnectionEvent);

        // Send personalized states to all connections
        await BroadcastPersonalizedStates(match);

        return new ReconnectionResponse
        {
            Success = true,
            Message = "Successfully reconnected!",
            Match = match,
            GameState = _gameEngine.CreateGameStateDtoForPlayer(match, player.Id),
            PlayerId = player.Id
        };
    }
}
