// GameHub_BroadcastPersonalizedStates.cs
namespace BelieveOrNot.Server.BelieveOrNot;

public partial class GameHub
{
    private async Task BroadcastPersonalizedStates(Match match)
    {
        // Send personalized state to each connection based on their mapped player
        var tasks = _connectionToPlayer
            .Where(kvp => kvp.Value.MatchId == match.Id)
            .Select(async kvp =>
            {
                var connectionId = kvp.Key;
                var playerId = kvp.Value.PlayerId;

                var playerState = _gameEngine.CreateGameStateDtoForPlayer(match, playerId);
                playerState.CreatorPlayerId = match.Players[0].Id;
                playerState.DeckSize = (int)match.Settings.DeckSize;
                playerState.JokerCount = match.Settings.JokerCount;

                await Clients.Client(connectionId).SendAsync("StateUpdate", playerState, Guid.Empty);
            });

        await Task.WhenAll(tasks);
    }
}
