// BelieveOrNot/DisposalEventData.cs
namespace BelieveOrNot.Server.BelieveOrNot;

public class DisposalEventData
{
    public string PlayerName { get; set; } = string.Empty;
    public string Rank { get; set; } = string.Empty;
    public int CardsDisposed { get; set; } = 4;
}
