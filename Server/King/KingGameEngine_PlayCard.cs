// Server/King/KingGameEngine_PlayCard.cs
namespace BelieveOrNot.Server.King;

public partial class KingGameEngine
{
    public KingGameStateDto PlayCard(KingMatch match, Guid playerId, Card card)
    {
        var player = match.Players.FirstOrDefault(p => p.Id == playerId);
        if (player == null)
        {
            throw new InvalidOperationException("Player not found");
        }

        // Validate the move using the same logic as the client
        if (!KingMoveValidator.IsValidCardPlay(match, player, card))
        {
            throw new InvalidOperationException("Invalid card play: " + GetInvalidMoveReason(match, player, card));
        }

        // Remove card from player's hand
        player.Hand.Remove(card);

        // Add card to current trick
        var currentTrick = match.CurrentTrick!;
        currentTrick.Cards.Add(new PlayedCard
        {
            Card = card,
            PlayerId = playerId,
            PlayOrder = currentTrick.Cards.Count
        });

        // Set lead suit for first card
        if (currentTrick.Cards.Count == 1)
        {
            currentTrick.LedSuit = card.GetSuit();
        }

        // Check if trick is complete
        if (currentTrick.Cards.Count == 4)
        {
            // Mark as complete but don't process yet - just show the 4 cards
            currentTrick.IsComplete = true;
        }
        else
        {
            // Advance to next player
            AdvanceCurrentPlayer(match);
        }

        return CreateGameStateDto(match);
    }
}