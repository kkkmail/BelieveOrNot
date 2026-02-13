// Server/King/KingGameEngine_CreateGameStateDtoForPlayer.cs
namespace BelieveOrNot.Server.King;

public partial class KingGameEngine
{
    public KingGameStateDto CreateGameStateDtoForPlayer(KingMatch match, Guid playerId)
    {
        var state = CreateGameStateDto(match);

        var player = match.Players.FirstOrDefault(p => p.Id == playerId);
        if (player != null)
        {
            state.YourHand = player.Hand
                .OrderBy(c => c.Rank switch
                {
                    "2" => 0, "3" => 1, "4" => 2, "5" => 3, "6" => 4,
                    "7" => 5, "8" => 6, "9" => 7, "10" => 8,
                    "J" => 9, "Q" => 10, "K" => 11, "A" => 12,
                    _ => -1
                })
                .ThenBy(c => c.Suit switch
                {
                    "Spades" => 0, "Clubs" => 1, "Diamonds" => 2, "Hearts" => 3,
                    _ => 99
                })
                .ToList();
            state.TrumpSelectionCards = player.TrumpSelectionCards?.ToList();
        }

        // Console.WriteLine($"{nameof(KingGameStateDto)}.{nameof(CreateGameStateDtoForPlayer)} - playerId: {playerId}, state: {state}");
        return state;
    }
}
