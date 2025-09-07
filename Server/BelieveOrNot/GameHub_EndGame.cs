// GameHub_EndGame.cs
namespace BelieveOrNot.Server.BelieveOrNot;

public partial class GameHub
{
    // End game method (creator only)
    public async Task EndGame(Guid matchId, Guid requestingPlayerId)
    {
        var match = _matchManager.GetMatch(matchId);
        if (match == null) throw new HubException("Match not found");

        // Check if requesting player is the creator
        if (requestingPlayerId != match.Players[0].Id)
        {
            throw new HubException("Only the match creator can end the game");
        }

        if (match.Phase == GamePhase.InProgress)
        {
            throw new HubException("Cannot end game while a round is in progress. End the round first.");
        }

        var playerName = match.Players.First(p => p.Id == requestingPlayerId).Name;

        // Calculate final results
        var sortedPlayers = match.Players
            .OrderByDescending(p => p.Score)
            .ThenBy(p => p.Name)
            .ToList();

        var winners = sortedPlayers
            .Where(p => p.Score == sortedPlayers[0].Score)
            .ToList();

        var finalScores = sortedPlayers.Select((p, index) => new PlayerFinalScore
        {
            PlayerName = p.Name,
            Score = p.Score,
            Position = index + 1
        }).ToList();

        var gameEndEvent = GameEventFactory.CreateGameEndEvent(
            playerName,
            winners.Select(w => w.Name).ToList(),
            winners[0].Score,
            finalScores
        );

        await Clients.Group($"match:{matchId}").SendAsync("GameEvent", gameEndEvent);

        // Send final results
        await Clients.Group($"match:{matchId}").SendAsync("GameEnded", new
        {
            Winners = winners.Select(w => w.Name).ToList(),
            FinalScores = finalScores.Select(s => $"{s.Position}. {s.PlayerName}: {s.Score} points").ToList(),
            WinnerText = winners.Count == 1
                ? $"🏆 {winners[0].Name} wins with {winners[0].Score} points!"
                : $"🏆 Tie game! Winners: {string.Join(", ", winners.Select(w => w.Name))} with {winners[0].Score} points each!"
        });

        // Mark game as ended
        match.Phase = GamePhase.GameEnd;
        await BroadcastPersonalizedStates(match);
    }
}
