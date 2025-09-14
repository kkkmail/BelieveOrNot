// Server/King/KingHub_SelectTrump.cs

using BelieveOrNot.Server.BelieveOrNot;

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

            // Broadcast trump selection event
            var trumpPlayer = match.Players.FirstOrDefault(p => p.Id == request.PlayerId);
            if (trumpPlayer != null)
            {
                var trumpSelectedEvent = new TrumpSelectedEvent
                {
                    PlayerName = trumpPlayer.Name,
                    TrumpSuit = request.TrumpSuit.ToString()
                };
                await _eventBroadcaster.BroadcastTrumpSelected(match, trumpSelectedEvent);
            }

            await BroadcastPersonalizedStates(match);
            return state;
        }
        catch (Exception ex)
        {
            throw new HubException($"Invalid trump selection: {ex.Message}");
        }
    }
}
