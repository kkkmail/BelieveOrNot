// BelieveOrNot/JoinEventData.cs
namespace BelieveOrNot.Server.BelieveOrNot;

public class JoinEventData
{
    public string PlayerName { get; set; } = string.Empty;
    public bool IsCreator { get; set; }
}
