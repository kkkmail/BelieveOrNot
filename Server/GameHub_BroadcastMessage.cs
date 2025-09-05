// Server/GameHub_BroadcastMessage.cs
namespace BelieveOrNot.Server;

public partial class GameHub
{
    // Method to broadcast messages to all players in a match
    public async Task BroadcastMessage(Guid matchId, string message)
    {
        var match = _matchManager.GetMatch(matchId);
        if (match == null) throw new HubException("Match not found");

        // Find the requesting player
        var connectionInfo = _connectionToPlayer.FirstOrDefault(kvp => kvp.Key == Context.ConnectionId);
        if (connectionInfo.Key == null) throw new HubException("Player not found");

        var requestingPlayer = match.Players.FirstOrDefault(p => p.Id == connectionInfo.Value.PlayerId);
        if (requestingPlayer == null) throw new HubException("Player not in match");

        // Create simple message event
        var messageEvent = new GameEventDto
        {
            Type = "Message",
            DisplayMessage = message,
            Data = new { SenderName = requestingPlayer.Name }
        };

        await Clients.Group($"match:{matchId}").SendAsync("GameEvent", messageEvent);
    }
}