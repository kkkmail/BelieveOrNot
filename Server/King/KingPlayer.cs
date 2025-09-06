namespace BelieveOrNot.Server.King;

public class KingPlayer
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public List<KingCard> Hand { get; set; } = new();
    public int Score { get; set; } = 0;
    public bool IsConnected { get; set; } = true;
    public string ClientId { get; set; } = string.Empty;
    public DateTime LastSeen { get; set; } = DateTime.UtcNow;
    public int Position { get; set; } // 0-3, position at table
}