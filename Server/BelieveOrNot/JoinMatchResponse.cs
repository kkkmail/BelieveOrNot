// JoinMatchResponse.cs
namespace BelieveOrNot.Server.BelieveOrNot;

public class JoinMatchResponse
{
    public bool Success { get; set; }
    public Match? Match { get; set; }
    public Guid? PlayerId { get; set; }
    public string AssignedName { get; set; } = string.Empty;
}
