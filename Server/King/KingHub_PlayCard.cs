// Server/King/KingHub_PlayCard.cs

using BelieveOrNot.Server.BelieveOrNot;

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

            // Broadcast card played event
            var playingPlayer = match.Players.FirstOrDefault(p => p.Id == request.PlayerId);
            if (playingPlayer != null)
            {
                var cardPlayedEvent = new CardPlayedEvent
                {
                    PlayerName = playingPlayer.Name,
                    Card = request.Card
                };
                await _eventBroadcaster.BroadcastCardPlayed(match, cardPlayedEvent);
            }

            await BroadcastPersonalizedStates(match);

            // Check if trick was just completed (4 cards and marked complete)
            if (match.CurrentTrick?.IsComplete == true && match.CurrentTrick.Cards.Count == 4)
            {
                await Task.Delay(2000);
                var completedState = await _gameEngine.CompleteTrickAndContinue(match);
                await BroadcastPersonalizedStates(match);
                return completedState;
            }

            return state;
        }
        catch (Exception ex)
        {
            throw new HubException($"Failed to play card: {ex.Message}");
        }
    }
}
