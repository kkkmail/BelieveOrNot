// Server/King/KingHub_SelectTrump.cs
namespace BelieveOrNot.Server.King;

public partial class KingHub
{
    public async Task<KingGameStateDto> SelectTrump(KingSelectTrumpRequest request)
    {
        var match = _matchManager.GetMatch(request.MatchId);
        if (match == null) throw new HubException("King match not found");

        try
        {
            var state = _gameEngine.SelectTrump(match, request.PlayerId, request.TrumpSuit);
            await BroadcastPersonalizedStates(match);
            return state;
        }
        catch (Exception ex)
        {
            throw new HubException($"Invalid trump selection: {ex.Message}");
        }
    }
}