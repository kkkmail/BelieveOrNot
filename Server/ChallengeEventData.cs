// ChallengeEventData.cs
namespace BelieveOrNot.Server;

public class ChallengeEventData
{
    public string ChallengerName { get; set; } = string.Empty;
    public string ChallengedPlayerName { get; set; } = string.Empty;
    public int CardIndex { get; set; }
    public int TotalCards { get; set; }
    public Card RevealedCard { get; set; } = null!;
    public string AnnouncedRank { get; set; } = string.Empty;
    public bool IsMatch { get; set; }
    public string CollectorName { get; set; } = string.Empty;
    public int CardsCollected { get; set; }
    public List<Card>? RemainingCards { get; set; } // For challenger animation
    public List<bool>? RemainingCardsMatch { get; set; } // NEW: Match status for each remaining card
}
