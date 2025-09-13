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
            await BroadcastPersonalizedStates(match);

            // Broadcast trump selection event to all players
            var trumpPlayer = match.Players.FirstOrDefault(p => p.Id == request.PlayerId);
            if (trumpPlayer != null)
            {
                var trumpSelectedEvent = new GameEventDto
                {
                    Type = "TrumpSelected",
                    DisplayMessage = $"👑 {trumpPlayer.Name} selected {request.TrumpSuit} as trump suit",
                    Data = new {
                        PlayerName = trumpPlayer.Name,
                        TrumpSuit = request.TrumpSuit,
                        PlayerId = request.PlayerId
                    }
                };
                await Clients.Group($"kingmatch:{match.Id}").SendAsync("GameEvent", trumpSelectedEvent);
            }

            return state;
        }
        catch (Exception ex)
        {
            throw new HubException($"Invalid trump selection: {ex.Message}");
        }
    }
}
