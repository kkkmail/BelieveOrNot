// Server/King/KingEnums.cs
namespace BelieveOrNot.Server.King;

public enum KingSuit
{
    Hearts,
    Diamonds,
    Clubs,
    Spades
}

public enum KingRank
{
    Seven = 7,
    Eight = 8,
    Nine = 9,
    Ten = 10,
    Jack = 11,
    Queen = 12,
    King = 13,
    Ace = 14
}

public enum KingRoundType
{
    DontTakeTricks,
    DontTakeHearts,
    DontTakeBoys,
    DontTakeQueens,
    DontTakeLastTwoTricks,
    DontTakeKingOfHearts,
    DontTakeAnything,
    CollectTricks
}

public enum KingGamePhase
{
    WaitingForPlayers,
    InProgress,
    RoundEnd,
    GameEnd
}