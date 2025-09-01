Create game state models in BelieveOrNot.Core/Models/:

1. Create GameState.cs:
   - Properties: MatchId, Players (ordered list), CurrentPlayerIndex, DealerIndex
   - TablePile (List<Card>), AnnouncedRank (string), GamePhase, Config
   - RoundNumber, Scores per player
   - Methods: GetCurrentPlayer(), GetNextPlayer(), IsRoundEnd()

2. Create Move.cs:
   - Properties: PlayerId, ActionType, Cards (for Play), ChallengePickIndex, ClientCmdId
   - Timestamp, validation methods

3. Create GameStateSnapshot.cs (for persistence):
   - All game state data in serializable format
   - Methods: FromGameState(), ToGameState()

4. Create comprehensive tests:
   - Test player rotation logic
   - Test round end detection
   - Test game state transitions
   - Test snapshot serialization/deserialization

Focus on the circular player order logic and ensure it handles edge cases correctly.
Run tests: `dotnet test --filter "GameState"`
