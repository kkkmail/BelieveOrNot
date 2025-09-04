public class CardPlayEventData
{
    public string PlayerName { get; set; } = string.Empty;
    public List<Card> CardsPlayed { get; set; } = new();
    public string DeclaredRank { get; set; } = string.Empty;
    public int RemainingCards { get; set; }
    public bool HasNoCardsLeft { get; set; }
}