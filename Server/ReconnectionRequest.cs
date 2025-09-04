// Server/ReconnectionRequest.cs
namespace BelieveOrNot.Server;

public class ReconnectionRequest
{
    public string MatchId { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
}