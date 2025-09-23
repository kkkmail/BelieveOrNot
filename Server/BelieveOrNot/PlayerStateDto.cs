// BelieveOrNot/PlayerStateDto.cs
namespace BelieveOrNot.Server.BelieveOrNot;

public record PlayerStateDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int HandCount { get; set; }
    public int Score { get; set; }
    public bool IsConnected { get; set; }
}
