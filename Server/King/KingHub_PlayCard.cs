// Server/King/KingHub_PlayCard.cs
namespace BelieveOrNot.Server.King;

public partial class KingHub
{
    public async Task<KingGameStateDto> PlayCard(KingPlayCardRequest request)
    {
        var match = _matchManager.GetMatch(request.MatchId);
        if (match == null) throw new HubException("King match not found");

        try
        {
            var state = _gameEngine.PlayCard(match, request.PlayerId, request.Card);
            await BroadcastPersonalizedStates(match);

            // Check if trick was just completed (4 cards and marked complete)
            if (match.CurrentTrick?.IsComplete == true && match.CurrentTrick.Cards.Count == 4)
            {
                // // Schedule trick completion after delay
                // _ = Task.Delay(2000).ContinueWith(async _ =>
                // {
                //     // Complete the trick and broadcast the updated state
                //     _gameEngine.CompleteTrickAndContinue(match);
                //     await BroadcastPersonalizedStates(match);
                // });

                await Task.Delay(2000);
                var comletedState = _gameEngine.CompleteTrickAndContinue(match);
                await BroadcastPersonalizedStates(match);
                return comletedState;
            }

            return state;
        }
        catch (Exception ex)
        {
            throw new HubException($"Failed to play card: {ex.Message}");
        }
    }
}