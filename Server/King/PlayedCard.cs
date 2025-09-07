// King/PlayedCard.cs
namespace BelieveOrNot.Server.King;

public class PlayedCard
{
    public Card Card { get; set; } = null!;
    public Guid PlayerId { get; set; }
    public int PlayOrder { get; set; }
}
