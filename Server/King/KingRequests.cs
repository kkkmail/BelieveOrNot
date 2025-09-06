// Server/King/KingRequests.cs
namespace BelieveOrNot.Server.King;

public class KingCreateMatchRequest
{
    public string PlayerName { get; set; } = string.Empty;
    public KingGameSettings? Settings { get; set; }
    public string? ClientId { get; set; }
}

public class KingJoinMatchRequest
{
    public string MatchId { get; set; } = string.Empty;
    public string PlayerName { get; set; } = string.Empty;
    public string? ClientId { get; set; }
}

public class KingPlayCardRequest
{
    public Guid MatchId { get; set; }
    public Guid PlayerId { get; set; }
    public KingCard Card { get; set; } = null!;
}

public class KingSelectTrumpRequest
{
    public Guid MatchId { get; set; }
    public Guid PlayerId { get; set; }
    public KingSuit Trump { get; set; }
}

public class KingJoinMatchResponse
{
    public bool Success { get; set; }
    public KingMatch? Match { get; set; }
    public Guid? PlayerId { get; set; }
    public string AssignedName { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

public class KingReconnectionRequest
{
    public string MatchId { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
}

public class KingReconnectionResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public KingMatch? Match { get; set; }
    public KingGameStateDto? GameState { get; set; }
    public Guid? PlayerId { get; set; }
}