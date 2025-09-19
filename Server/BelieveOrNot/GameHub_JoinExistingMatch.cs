// BelieveOrNot/GameHub_JoinExistingMatch.cs
namespace BelieveOrNot.Server.BelieveOrNot;

public partial class GameHub
{
    public async Task<JoinMatchResponse> JoinExistingMatch(string matchIdString, string playerName, string playerIdString)
    {
        if (!Guid.TryParse(matchIdString, out var matchId))
        {
            throw new HubException("Invalid match ID format.");
        }

        if (!Guid.TryParse(playerIdString, out var playerId))
        {
            throw new HubException("Invalid player ID format.");
        }

        var match = _matchManager.GetMatch(matchId);
        if (match == null)
        {
            throw new HubException("The game you're trying to join no longer exists or has ended.");
        }

        if (match.Phase != GamePhase.WaitingForPlayers)
        {
            throw new HubException("This game has already started and new players cannot join.");
        }

        try
        {
            match = _matchManager.JoinMatch(matchId, playerName, playerId);
            await Groups.AddToGroupAsync(Context.ConnectionId, $"match:{matchId}");

            // Map this connection to the joining player
            var joiningPlayer = match.Players.Last();
            _connectionToPlayer[Context.ConnectionId] = (matchId, joiningPlayer.Id);

            // Broadcast join event to all players
            var joinEvent = GameEventFactory.CreateJoinEvent(joiningPlayer.Name, false);
            await Clients.Group($"match:{matchId}").SendAsync("GameEvent", joinEvent);

            // Send personalized states to all connections
            await BroadcastPersonalizedStates(match);

            return new JoinMatchResponse
            {
                Success = true,
                Match = match,
                PlayerId = joiningPlayer.Id,
                AssignedName = joiningPlayer.Name
            };
        }
        catch (InvalidOperationException ex)
        {
            throw new HubException(ex.Message);
        }
    }
}
