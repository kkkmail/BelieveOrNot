// GameEventFactory_CreateGameEndEvent.cs
namespace BelieveOrNot.Server;

public static partial class GameEventFactory
{
    public static GameEventDto CreateGameEndEvent(string initiatorName, List<string> winnerNames, int winnerScore, List<PlayerFinalScore> finalScores)
    {
        var data = new GameEndEventData
        {
            InitiatorName = initiatorName,
            WinnerNames = winnerNames,
            WinnerScore = winnerScore,
            FinalScores = finalScores
        };

        return new GameEventDto
        {
            Type = "GameEnd",
            DisplayMessage = MessageFormatter.GameEnd(initiatorName, winnerNames, winnerScore),
            Data = data
        };
    }
}
