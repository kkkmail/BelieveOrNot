// King/KingGameSettings.cs
namespace BelieveOrNot.Server.King;

public class KingGameSettings
{
    public bool IncludeAvoidEverythingRound { get; set; } = false;
    public int CollectingPhaseRounds { get; set; } = 8; // 4 or 8

    public List<GameRound> CreateGameRounds()
    {
        var rounds = new List<GameRound>();
        int roundNumber = 1;

        // // Phase 1: Avoiding rounds
        // rounds.Add(GameRound.CreateAvoidTricks(roundNumber++));
        // rounds.Add(GameRound.CreateAvoidHearts(roundNumber++));
        // rounds.Add(GameRound.CreateAvoidBoys(roundNumber++));
        // rounds.Add(GameRound.CreateAvoidQueens(roundNumber++));
        // rounds.Add(GameRound.CreateAvoidLastTwoTricks(roundNumber++));
        // rounds.Add(GameRound.CreateAvoidKingOfHearts(roundNumber++));
        //
        // if (IncludeAvoidEverythingRound)
        // {
        //     rounds.Add(GameRound.CreateAvoidEverything(roundNumber++));
        // }

        // Phase 2: Collecting rounds
        for (int i = 0; i < CollectingPhaseRounds; i++)
        {
            // We'll set the trump chooser when the match starts and we know player order
            rounds.Add(GameRound.CreateCollectTricks(roundNumber++));
        }

        return rounds;
    }
}
