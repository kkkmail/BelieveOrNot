namespace BelieveOrNot.Server.King;

public class KingEventDto
{
    public string Type { get; set; } = string.Empty;
    public string DisplayMessage { get; set; } = string.Empty;
    public object? Data { get; set; }
}