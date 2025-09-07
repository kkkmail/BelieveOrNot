// GameHub_StartRound.cs
namespace BelieveOrNot.Server;

public partial class GameHub
{
    public async Task StartRound(Guid matchId, Guid requestingPlayerId)
    {
        var match = _matchManager.GetMatch(matchId);
        if (match == null) throw new HubException("Match not found");

        // Check if requesting player is the creator (first player)
        if (requestingPlayerId != match.Players[0].Id)
        {
            throw new HubException("Only the match creator can start the round");
        }

        var roundState = _gameEngine.StartNewRound(match);

        // Broadcast the round start event
        if (roundState.Event != null)
        {
            await Clients.Group($"match:{match.Id}").SendAsync("GameEvent", roundState.Event);
        }

        // Send personalized states to all connections
        await BroadcastPersonalizedStates(match);
    }
}
