// BelieveOrNot/GameEngine_AutoDisposeFourOfAKind.cs
namespace BelieveOrNot.Server.BelieveOrNot;

public partial class GameEngine
{
    private List<string> AutoDisposeFourOfAKind(Player player, Match match)
    {
        var disposedRanks = new List<string>();
        var groups = player.Hand.Where(c => !c.IsJoker)
            .GroupBy(c => c.Rank)
            .Where(g => g.Count() >= 4)
            .ToList();

        foreach (var group in groups)
        {
            var cardsToRemove = group.Take(4).ToList();
            foreach (var card in cardsToRemove)
            {
                player.Hand.Remove(card);
            }
            disposedRanks.Add(group.Key);
            match.DisposedRanks.Add(group.Key); // Track disposed rank
        }

        return disposedRanks;
    }
}
