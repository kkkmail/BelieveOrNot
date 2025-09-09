// BelieveOrNot/GameHub_EndRound.cs
namespace BelieveOrNot.Server.BelieveOrNot;

public partial class GameHub
{
    // End round method (creator only)
    public async Task EndRound(Guid matchId, Guid requestingPlayerId)
    {
        var match = _matchManager.GetMatch(matchId);
        if (match == null) throw new HubException("Match not found");

        // Check if requesting player is the creator
        if (requestingPlayerId != match.Players[0].Id)
        {
            throw new HubException("Only the match creator can end the round");
        }

        if (match.Phase != GamePhase.InProgress)
        {
            throw new HubException("No round is currently in progress");
        }

        var playerName = match.Players.First(p => p.Id == requestingPlayerId).Name;

        // Reset match state
        match.Phase = GamePhase.WaitingForPlayers;
        match.TablePile.Clear();
        match.AnnouncedRank = null;
        match.LastPlayCardCount = 0;
        match.CurrentPlayerIndex = 0;

        // Clear all hands
        foreach (var player in match.Players)
        {
            player.Hand.Clear();
        }

        var endEvent = new GameEventDto
        {
            Type = "RoundEnd",
            DisplayMessage = $"🛑 {MessageFormatter.FormatPlayer(playerName)} ended the round. No scores were calculated.",
            Data = new { InitiatorName = playerName, Cancelled = true }
        };

        await Clients.Group($"match:{matchId}").SendAsync("GameEvent", endEvent);
        await BroadcastPersonalizedStates(match);
    }
}
