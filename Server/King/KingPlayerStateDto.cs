// King/KingPlayerStateDto.cs
namespace BelieveOrNot.Server.King;

public class KingPlayerStateDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int HandCount { get; set; }
    public int Score { get; set; }
    public bool IsConnected { get; set; }
    public int TricksWon { get; set; }
}
