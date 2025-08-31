public class CreateMatchRequest
{
    public string PlayerName { get; set; } = string.Empty;
    public GameSettings? Settings { get; set; }
}