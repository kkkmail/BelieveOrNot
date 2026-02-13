// Services/KingViewModel.cs
using BelieveOrNot.Server.King;
using BelieveOrNot.Server.Shared;

namespace BelieveOrNot.Server.Services;

public class KingViewModel
{
    public KingGameStateDto State { get; set; } = new();
    public Guid YourPlayerId { get; set; }

    public bool IsCreator => State.Players.Count > 0 && State.Players[0].Id == YourPlayerId;

    public bool IsYourTurn => State.Players.Count > State.CurrentPlayerIndex
                              && State.Players[State.CurrentPlayerIndex].Id == YourPlayerId;

    public string? YourName => State.Players.FirstOrDefault(p => p.Id == YourPlayerId)?.Name;

    public string? CurrentPlayerName => State.Players.Count > State.CurrentPlayerIndex
        ? State.Players[State.CurrentPlayerIndex].Name : null;

    public bool CanPlay => State.Phase == GamePhase.InProgress
                           && IsYourTurn
                           && !State.WaitingForTrumpSelection
                           && (State.YourHand?.Count ?? 0) > 0;

    public bool CanSelectTrump => State.Phase == GamePhase.InProgress
                                   && State.WaitingForTrumpSelection
                                   && IsYourTurn;

    public bool IsGameComplete => State.CurrentRoundIndex >= TotalRounds;

    public int TotalRounds => State.CurrentRound != null
        ? 14 // default: 6 avoiding + 8 collecting
        : 0;

    public Suit? LeadSuit => State.CurrentTrick?.LedSuit;

    /// <summary>
    /// Computes which suits the player is allowed to play based on trick state and round rules.
    /// Returns null if all suits are playable.
    /// </summary>
    public string? SelectableSuits
    {
        get
        {
            if (!CanPlay) return null;
            var hand = State.YourHand;
            if (hand == null || hand.Count == 0) return null;

            var round = State.CurrentRound;
            if (round == null) return null;

            var trick = State.CurrentTrick;
            if (trick == null) return null;

            // Leading the trick
            if (trick.Cards.Count == 0)
            {
                if (round.CannotLeadHearts)
                {
                    var hasNonHearts = hand.Any(c => c.Suit != "Hearts");
                    if (hasNonHearts)
                        return "Spades,Clubs,Diamonds";
                }
                return null; // all suits allowed
            }

            // Following — must follow lead suit if possible
            var leadSuit = trick.LedSuit;
            if (leadSuit == null) return null;

            var leadSuitStr = leadSuit.Value.ToString();
            var hasSameSuit = hand.Any(c => c.Suit == leadSuitStr);
            if (hasSameSuit)
                return leadSuitStr;

            // No cards of lead suit — collecting phase: must play trump if have it
            if (round.IsCollectingPhase && State.SelectedTrumpSuit.HasValue)
            {
                var trumpStr = State.SelectedTrumpSuit.Value.ToString();
                var hasTrump = hand.Any(c => c.Suit == trumpStr);
                if (hasTrump)
                    return trumpStr;
            }

            // No lead suit, no trump requirement — play anything
            return null;
        }
    }
}
