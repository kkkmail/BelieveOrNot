namespace BelieveOrNot.Shared;

public enum Rank
{
    Two = 2, Three, Four, Five, Six, Seven, Eight, Nine, Ten, Jack, Queen, King, Ace,
    Joker = 99
}
public enum Suit { Clubs, Diamonds, Hearts, Spades, None = 99 }

public readonly record struct Card(Rank Rank, Suit Suit);

public enum MoveType { Play, Challenge }

public sealed record SubmitMoveRequest(
    System.Guid MatchId, System.Guid ClientCmdId, int TurnNo, MoveType Type,
    System.Collections.Generic.IReadOnlyList<Card>? Cards = null,
    int? ChallengePickIndex = null);

public sealed record CreateMatchRequest(
    int DeckSize, int JokerCount, bool CanDisposeJokers,
    int ScoreCard = -1, int ScoreJoker = -3, int WinnerBonus = 5, int InviteTimeoutSec = 300);

public sealed record GameStateDto(
    System.Guid MatchId, System.Guid CurrentPlayerId, int TurnNo,
    System.Collections.Generic.IReadOnlyDictionary<System.Guid,int> HandCounts,
    int TableCount, Rank? AnnouncedRank, bool RoundEnded);

public sealed record ErrorDto(string Code, string Message);
