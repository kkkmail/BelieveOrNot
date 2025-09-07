// GameEventFactory_CreateRoundEndEvent.cs
namespace BelieveOrNot.Server;

public static partial class GameEventFactory
{
    public static GameEventDto CreateRoundEndEvent(int roundNumber, List<string> winnerNames, List<PlayerScoreResult> scoreResults)
    {
        var data = new RoundEndEventData
        {
            RoundNumber = roundNumber,
            WinnerNames = winnerNames,
            ScoreResults = scoreResults
        };

        var displayMessage = MessageFormatter.RoundEnd(roundNumber, winnerNames);
        var scoreMessages = scoreResults.Select(r =>
            MessageFormatter.ScoreResult(r.PlayerName, r.ScoreChange, r.IsWinner, r.WinnerBonus, r.RegularCards, r.JokerCards, r.ScoreChange - r.WinnerBonus, r.JokerCards * -3));
        displayMessage += " Scoring: " + string.Join(", ", scoreMessages);

        return new GameEventDto
        {
            Type = "RoundEnd",
            DisplayMessage = displayMessage,
            Data = data
        };
    }
}
