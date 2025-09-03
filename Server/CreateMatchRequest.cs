// Server/CreateMatchRequest.cs
public class CreateMatchRequest
{
    public string PlayerName { get; set; } = string.Empty;
    public GameSettings? Settings { get; set; }
    public string? ClientId { get; set; } // NEW: For reconnection support
}