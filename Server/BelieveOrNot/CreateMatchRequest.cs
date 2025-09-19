// BelieveOrNot/CreateMatchRequest.cs
namespace BelieveOrNot.Server.BelieveOrNot;

public class CreateMatchRequest
{
    public string PlayerName { get; set; } = string.Empty;
    public GameSettings? Settings { get; set; }
    public Guid PlayerId { get; set; }
}
