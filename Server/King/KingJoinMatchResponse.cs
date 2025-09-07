namespace BelieveOrNot.Server.King;

public class KingJoinMatchResponse
{
    public bool Success { get; set; }
    public KingMatch? Match { get; set; }
    public Guid? PlayerId { get; set; }
    public string AssignedName { get; set; } = string.Empty;
    public string? Message { get; set; }
}