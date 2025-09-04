// Server/GameEventDto.cs
public class GameEventDto
{
    public string Type { get; set; } = string.Empty;
    public string DisplayMessage { get; set; } = string.Empty;
    public object? Data { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
