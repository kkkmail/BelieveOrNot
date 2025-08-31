public record Card(string Rank, string Suit)
{
    public bool IsJoker => Rank == "Joker";
    
    public override string ToString() => IsJoker ? "Joker" : $"{Rank} of {Suit}";
}