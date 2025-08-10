using BelieveOrNot.Shared;
using Microsoft.AspNetCore.SignalR;

namespace BelieveOrNot.Server;

public class GameHub : Hub
{
    private static string MatchGroup(System.Guid matchId) => $"match:{matchId:N}";

    public async Task CreateOrJoinMatch(CreateMatchRequest req)
    {
        // TODO: Create/lookup match, seat player, add to SignalR group.
        await Clients.Caller.SendAsync("StateUpdate",
            new GameStateDto(System.Guid.NewGuid(), System.Guid.NewGuid(), 0,
                new Dictionary<System.Guid,int>(), 0, null, false),
            System.Guid.Empty);
    }

    public async Task SubmitMove(SubmitMoveRequest req)
    {
        // TODO: Validate + apply via RoundEngine, broadcast update.
        await Clients.Group(MatchGroup(req.MatchId)).SendAsync("StateUpdate",
            new GameStateDto(req.MatchId, System.Guid.NewGuid(), req.TurnNo + 1,
                new Dictionary<System.Guid,int>(), 0, null, false),
            req.ClientCmdId);
    }
}
