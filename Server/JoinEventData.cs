// JoinEventData.cs
namespace BelieveOrNot.Server;

public class JoinEventData
{
    public string PlayerName { get; set; } = string.Empty;
    public bool IsCreator { get; set; }
}
