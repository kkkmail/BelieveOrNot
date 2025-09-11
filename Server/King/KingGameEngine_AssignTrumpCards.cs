// Server/King/KingGameEngine_DealCards.cs
namespace BelieveOrNot.Server.King;

public partial class KingGameEngine
{
    private void AssignTrumpCards(KingMatch match, int trumCards)
    {
        foreach (var player in match.Players)
        {
            player.TrumpSelectionCards = player.Hand.Take(trumCards).ToList();
        }
    }
}
