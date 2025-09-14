// Shared/Player.cs
namespace BelieveOrNot.Server.Shared;

public record Player
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public List<Card> Hand { get; set; } = new();
    public int Score { get; set; } = 0;
    public bool IsConnected { get; set; } = true;
    public string ClientId { get; set; } = string.Empty; // NEW: For reconnection
    public DateTime LastSeen { get; set; } = DateTime.UtcNow; // NEW: Track last activity
    public List<Card>? TrumpSelectionCards { get; set; } = new(); // Cards for trump selection - usually first 3
}
