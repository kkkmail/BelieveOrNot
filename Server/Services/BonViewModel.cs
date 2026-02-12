// Services/BonViewModel.cs
using BelieveOrNot.Server.BelieveOrNot;

namespace BelieveOrNot.Server.Services;

public class BonViewModel
{
    public GameStateDto State { get; set; } = new();
    public Guid YourPlayerId { get; set; }
    public int MaxCardsPerPlay { get; set; } = 3;
    public int MinCardsPerPlay { get; set; } = 1;

    public bool IsCreator => State.CreatorPlayerId == YourPlayerId;

    public bool IsYourTurn => State.Players.Count > State.CurrentPlayerIndex
                              && State.Players[State.CurrentPlayerIndex].Id == YourPlayerId;

    public string? YourName => State.Players.FirstOrDefault(p => p.Id == YourPlayerId)?.Name;

    public string? CurrentPlayerName => State.Players.Count > State.CurrentPlayerIndex
        ? State.Players[State.CurrentPlayerIndex].Name : null;

    public bool IsOpeningPlay => State.Phase == GamePhase.InProgress
                                 && string.IsNullOrEmpty(State.AnnouncedRank);

    public bool CanChallenge => State.Phase == GamePhase.InProgress
                                && IsYourTurn
                                && State.LastPlayCardCount > 0
                                && !string.IsNullOrEmpty(State.AnnouncedRank);

    public bool CanPlay => State.Phase == GamePhase.InProgress
                           && IsYourTurn
                           && (State.YourHand?.Count ?? 0) > 0;

    // True when the "Last Play" cards belong to this player (show face-up)
    public bool IsYourLastPlay => State.LastPlayedCards != null && State.LastPlayedCards.Count > 0;

    // True when a challenge just happened (show result animation)
    public bool HasChallengeResult => State.ChallengeResult != null;
}
