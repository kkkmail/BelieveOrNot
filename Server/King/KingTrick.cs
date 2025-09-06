namespace BelieveOrNot.Server.King;

public class KingTrick
{
    public List<KingCard> Cards { get; set; } = new();
    public List<KingPlayer> PlayOrder { get; set; } = new();
    public KingPlayer Winner { get; set; } = null!;
    public KingSuit? Trump { get; set; }
    public KingSuit LeadSuit { get; set; }
    public int TrickNumber { get; set; }
}