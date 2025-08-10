Implement the scoring system in BelieveOrNot.Core/Engine/:

1. Create ScoringService.cs:
   - CalculateRoundScore(Player player, GameConfig config): Returns score
   - Handle ScorePerCard, ScorePerJoker, WinnerBonus
   - Support multiple winners (simultaneous zero cards)
   - DetermineRoundWinners(List<Player> players): Returns winner list

2. Extend RulesEngine:
   - Apply scoring when round ends
   - Update player total scores
   - Determine next dealer (round winner)

3. Create ScoringTests.cs:
   - Test basic scoring calculation
   - Test winner bonus application
   - Test multiple simultaneous winners
   - Test custom scoring weights
   - Test dealer rotation

Ensure scoring matches section 8 requirements exactly.
Run tests: `dotnet test --filter "Scoring"`
