// Shared/Card.cs
// GENERALIZED: Moved from BelieveOrNot to be shared between games
namespace BelieveOrNot.Server.Shared;

public record Card(string Rank, string Suit)
{
    public bool IsJoker => Rank == "Joker";
    public bool IsKingOfHearts => Rank == "K" && Suit == "Hearts";

    public override string ToString() => IsJoker ? "Joker" : $"{Rank} of {Suit}";
}