// Server/King/KingHub_JoinExistingMatch.cs
namespace BelieveOrNot.Server.King;

public partial class KingHub
{
    public async Task<KingJoinMatchResponse> JoinExistingMatch(string matchIdString, string playerName, string clientId = "")
    {
        if (!Guid.TryParse(matchIdString, out var matchId))
        {
            throw new HubException("Invalid match ID format.");
        }

        var match = _matchManager.GetMatch(matchId);
        if (match == null)
        {
            throw new HubException("The King game you're trying to join no longer exists or has ended.");
        }

        if (match.Phase != GamePhase.WaitingForPlayers)
        {
            throw new HubException("This King game has already started and new players cannot join.");
        }

        if (match.Players.Count >= 4)
        {
            throw new HubException("This King game is full (4 players maximum).");
        }

        try
        {
            match = _matchManager.JoinMatch(matchId, playerName, clientId);
            await Groups.AddToGroupAsync(Context.ConnectionId, $"kingmatch:{matchId}");

            var joiningPlayer = match.Players.Last();
            _connectionToPlayer[Context.ConnectionId] = (matchId, joiningPlayer.Id);

            await BroadcastPersonalizedStates(match);

            return new KingJoinMatchResponse
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