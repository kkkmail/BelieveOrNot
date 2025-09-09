// King/KingHub_EndRound.cs
namespace BelieveOrNot.Server.King;

public partial class KingHub
{
    // End round method (creator only)
    public async Task EndRound(KingEndRoundRequest request)
    {
        var match = _matchManager.GetMatch(request.MatchId);
        if (match == null) throw new HubException("King match not found");

        // Check if requesting player is the creator
        if (request.PlayerId != match.Players[0].Id)
        {
            throw new HubException("Only the match creator can end the round");
        }

        if (match.Phase != GamePhase.InProgress)
        {
            throw new HubException("No round is currently in progress");
        }

        var playerName = match.Players.First(p => p.Id == request.PlayerId).Name;

        // Reset match state and advance to next round (cancelled round doesn't count)
        match.Phase = GamePhase.WaitingForPlayers;
        match.CurrentTrick = null;
        match.CompletedTricks.Clear();
        match.WaitingForTrumpSelection = false;
        match.SelectedTrumpSuit = null;
        match.CurrentPlayerIndex = 0;
        
        // Advance to next round since this one is cancelled
        match.CurrentRoundIndex++;

        // Clear all hands
        foreach (var player in match.Players)
        {
            player.Hand.Clear();
        }

        // Broadcast the updated game state to all players
        await BroadcastPersonalizedStates(match);

        // Optionally send a message event about the round ending
        var endEvent = new BelieveOrNot.GameEventDto
        {
            Type = "RoundEnd",
            DisplayMessage = $"🛑 {playerName} ended the round. No scores were calculated.",
            Data = new { InitiatorName = playerName, Cancelled = true }
        };

        await Clients.Group($"kingmatch:{match.Id}").SendAsync("GameEvent", endEvent);
    }
}