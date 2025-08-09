using BelieveOrNot.Shared;
using Microsoft.AspNetCore.SignalR;

namespace BelieveOrNot.Server;

public class GameHub : Hub
{
    private static readonly string MatchGroup(Guid matchId) => $"match:{matchId:N}";

    public async Task CreateOrJoinMatch(CreateMatchRequest req)
    {
        // TODO: create match, seat player, add to SignalR group
        await Clients.Caller.SendAsync(""StateUpdate"", new GameStateDto(Guid.NewGuid(), Guid.NewGuid(), 0,
            new Dictionary<Guid,int>(), 0, null, false), Guid.Empty);
    }

    public async Task SubmitMove(SubmitMoveRequest req)
    {
        // TODO: authoritative validation and broadcast
        await Clients.Group(MatchGroup(req.MatchId)).SendAsync(""StateUpdate"", 
            new GameStateDto(req.MatchId, Guid.NewGuid(), req.TurnNo+1, new Dictionary<Guid,int>(), 0, null, false),
            req.ClientCmdId);
    }
}
