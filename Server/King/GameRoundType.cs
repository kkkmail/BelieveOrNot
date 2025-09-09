// King/GameRoundType.cs
namespace BelieveOrNot.Server.King;

public enum GameRoundType
{
    // Avoiding Phase
    AvoidTricks,          // Don't take tricks (-2 per trick)
    AvoidHearts,          // Don't take Hearts (-2 per Heart)
    AvoidBoys,            // Don't take Jacks/Kings (-2 per Boy)
    AvoidQueens,          // Don't take Queens (-4 per Queen)
    AvoidLastTwoTricks,   // Don't take last 2 tricks (-8 per trick)
    AvoidKingOfHearts,    // Don't take King of Hearts (-16)
    AvoidEverything,      // Combination of all above (-96 total) [OPTIONAL]
    
    // Collecting Phase
    CollectTricks         // Collect tricks (+3 per trick)
}