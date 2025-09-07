// GameHub_SubmitMove.cs
namespace BelieveOrNot.Server.BelieveOrNot;

public partial class GameHub
{
    public async Task<GameStateDto> SubmitMove(SubmitMoveRequest request)
    {
        // Check for duplicate command (idempotency)
        if (_processedCommands.ContainsKey(request.ClientCmdId))
        {
            var match = _matchManager.GetMatch(request.MatchId);
            if (match != null)
            {
                return new GameStateDto { MatchId = request.MatchId, Phase = match.Phase };
            }
        }

        var gameMatch = _matchManager.GetMatch(request.MatchId);
        if (gameMatch == null) throw new HubException("Match not found");

        try
        {
            // Use the player ID from the request
            var state = _gameEngine.SubmitMove(gameMatch, request.PlayerId, request);
            _processedCommands.TryAdd(request.ClientCmdId, request.MatchId);

            // Broadcast the game event if one was generated
            if (state.Event != null)
            {
                // Add appropriate icons based on event type
                var enhancedMessage = state.Event.DisplayMessage;
                if (state.Event.Type == "Challenge")
                {
                    enhancedMessage = "⚔️ " + enhancedMessage;
                }
                else if (state.Event.Type == "CardPlay")
                {
                    enhancedMessage = "🃏 " + enhancedMessage;
                }
                else if (state.Event.Type == "Disposal")
                {
                    enhancedMessage = "♠️♥️♦️♣️ " + enhancedMessage;
                }
                else if (state.Event.Type == "RoundEnd")
                {
                    enhancedMessage = "🏁 " + enhancedMessage;
                }

                // Create enhanced event for broadcast
                var broadcastEvent = new GameEventDto
                {
                    Type = state.Event.Type,
                    DisplayMessage = enhancedMessage,
                    Data = state.Event.Data,
                    Timestamp = state.Event.Timestamp
                };

                await Clients.Group($"match:{gameMatch.Id}").SendAsync("GameEvent", broadcastEvent);
            }

            // Send personalized states to all connections
            await BroadcastPersonalizedStates(gameMatch);

            return state;
        }
        catch (Exception ex)
        {
            throw new HubException($"Invalid move: {ex.Message}");
        }
    }
}
