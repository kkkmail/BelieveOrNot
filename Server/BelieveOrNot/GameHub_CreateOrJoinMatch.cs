// BelieveOrNot/GameHub_CreateOrJoinMatch.cs
namespace BelieveOrNot.Server.BelieveOrNot;

public partial class GameHub
{
    public async Task<GameStateDto> CreateOrJoinMatch(CreateMatchRequest request)
    {
        Match match;

        try
        {
            // Try to create new match
            match = _matchManager.CreateMatch(request.PlayerName, request.PlayerId, request.Settings);
            await Groups.AddToGroupAsync(Context.ConnectionId, $"match:{match.Id}");

            // Map this connection to the creator player
            PlayerToConnection[match.Players[0].Id] = (match.Id, Context.ConnectionId);
        }
        catch
        {
            throw new HubException("Failed to create match");
        }

        var state = new GameStateDto
        {
            MatchId = match.Id,
            Phase = match.Phase,
            Players = match.Players.Select(p => new PlayerStateDto
            {
                Id = p.Id,
                Name = p.Name,
                HandCount = p.Hand.Count,
                Score = p.Score,
                IsConnected = p.IsConnected
            }).ToList(),
            CreatorPlayerId = match.Players[0].Id,
            DeckSize = (int)match.Settings.DeckSize,
            JokerCount = match.Settings.JokerCount
        };

        // Broadcast game event to all players
        var createEvent = GameEventFactory.CreateJoinEvent(request.PlayerName, true);
        await Clients.Group($"match:{match.Id}").SendAsync("GameEvent", createEvent);

        // Also send state update
        await Clients.Group($"match:{match.Id}").SendAsync("StateUpdate", state, Guid.Empty);
        return state;
    }
}
