// Server/GameEngine_EndRound.cs
namespace BelieveOrNot.Server;

public partial class GameEngine
{
    private void EndRound(Match match)
    {
        if (match.Phase == GamePhase.RoundEnd)
        {
            Console.WriteLine("WARNING: EndRound called but round already ended - skipping");
            return;
        }

        match.Phase = GamePhase.RoundEnd;
        var scoreResults = new List<PlayerScoreResult>();
        var winners = new List<Player>();

        foreach (var player in match.Players)
        {
            int regularCards = player.Hand.Count(c => !c.IsJoker);
            int jokerCards = player.Hand.Count(c => c.IsJoker);

            var regularCardPenalty = regularCards * match.Settings.ScorePerCard;
            var jokerCardPenalty = jokerCards * match.Settings.ScorePerJoker;
            var winnerBonus = 0;

            if (player.Hand.Count == 0)
            {
                winnerBonus = match.Settings.WinnerBonus;
                match.DealerIndex = match.Players.IndexOf(player);
                winners.Add(player);
            }

            var roundScore = regularCardPenalty + jokerCardPenalty + winnerBonus;
            player.Score += roundScore;

            scoreResults.Add(new PlayerScoreResult
            {
                PlayerName = player.Name,
                ScoreChange = roundScore,
                TotalScore = player.Score,
                IsWinner = player.Hand.Count == 0,
                RegularCards = regularCards,
                JokerCards = jokerCards,
                WinnerBonus = winnerBonus
            });
        }

        var roundEndEvent = GameEventFactory.CreateRoundEndEvent(
            match.RoundNumber,
            winners.Select(w => w.Name).ToList(),
            scoreResults
        );

        Console.WriteLine($"Round {match.RoundNumber} ended: {roundEndEvent.DisplayMessage}");
    }
}