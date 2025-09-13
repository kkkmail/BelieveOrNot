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
            await BroadcastPersonalizedStates(match);

            // Broadcast card played event to all players
            var playingPlayer = match.Players.FirstOrDefault(p => p.Id == request.PlayerId);
            if (playingPlayer != null)
            {
                var cardPlayedEvent = new GameEventDto
                {
                    Type = "CardPlayed",
                    DisplayMessage = $"🃏 {playingPlayer.Name} played {request.Card.Rank} of {request.Card.Suit}",
                    Data = new {
                        PlayerName = playingPlayer.Name,
                        Card = request.Card,
                        PlayerId = request.PlayerId,
                    }
                };
                await Clients.Group($"kingmatch:{match.Id}").SendAsync("GameEvent", cardPlayedEvent);
            }

            // Check if trick was just completed (4 cards and marked complete)
            if (match.CurrentTrick?.IsComplete == true && match.CurrentTrick.Cards.Count == 4)
            {
                // Schedule trick completion after delay
                await Task.Delay(2000);
                var (completedState, trickResult) = _gameEngine.CompleteTrickAndContinue(match);

                // Broadcast trick completion event if we have results
                if (trickResult != null && trickResult.WinnerName != null)
                {
                    var trickCards = string.Join(", ", trickResult.TrickCards.Select(pc => $"{pc.Card.Rank} of {pc.Card.Suit}"));
                    var trickWonEvent = new GameEventDto
                    {
                        Type = "TrickWon",
                        DisplayMessage = $"🏆 {trickResult.WinnerName} won trick #{trickResult.TrickNumber} with {trickResult.WinningCard.Card.Rank} of {trickResult.WinningCard.Card.Suit}",
                        Data = new {
                            WinnerName = trickResult.WinnerName,
                            WinningCard = trickResult.WinningCard.Card,
                            TrickCards = trickCards,
                            TrickNumber = trickResult.TrickNumber
                        }
                    };
                    await Clients.Group($"kingmatch:{match.Id}").SendAsync("GameEvent", trickWonEvent);
                }

                await BroadcastPersonalizedStates(match);
                return completedState;            }

            return state;
        }
        catch (Exception ex)
        {
            throw new HubException($"Failed to play card: {ex.Message}");
        }
    }
}
