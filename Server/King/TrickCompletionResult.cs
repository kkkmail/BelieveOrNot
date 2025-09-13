namespace BelieveOrNot.Server.King;

public class TrickCompletionResult
{
    public PlayedCard WinningCard { get; set; }
    public string WinnerName { get; set; }
    public List<PlayedCard> TrickCards { get; set; } = new();
    public int TrickNumber { get; set; }
}