namespace BelieveOrNot.Server.King;

public class TrickCompletionResult
{
    public required PlayedCard WinningCard { get; set; }
    public required string WinnerName { get; set; }
    public List<PlayedCard> TrickCards { get; set; } = new();
    public int TrickNumber { get; set; }
}
