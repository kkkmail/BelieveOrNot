// Server/King/KingModels.cs
namespace BelieveOrNot.Server.King;

public record KingCard(KingRank Rank, KingSuit Suit)
{
    public override string ToString() => $"{Rank} of {Suit}";
    
    public bool IsKingOfHearts => Rank == KingRank.King && Suit == KingSuit.Hearts;
}