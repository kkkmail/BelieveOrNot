// Server/King/KingHub_StartRound.cs
namespace BelieveOrNot.Server.King;

public partial class KingHub
{
    public async Task<KingGameStateDto> StartRound(KingStartRoundRequest request)
    {
        var match = _matchManager.GetMatch(request.MatchId);
        if (match == null) throw new HubException("King match not found");

        // Check if requesting player is the creator (first player)
        if (request.PlayerId != match.Players[0].Id)
        {
            throw new HubException("Only the match creator can start the round");
        }

        if (match.Players.Count != 4)
        {
            throw new HubException("King game requires exactly 4 players");
        }

        try
        {
            var state = _gameEngine.StartNewRound(match);
            await BroadcastPersonalizedStates(match);
            return state;
        }
        catch (Exception ex)
        {
            throw new HubException($"Failed to start round: {ex.Message}");
        }
    }
}