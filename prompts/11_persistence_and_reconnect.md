Implement persistence layer (phase 2 feature) in BelieveOrNot.Core/:

1. Create IGameRepository interface:
   - SaveGameState(GameState state)
   - LoadGameState(Guid matchId)
   - SaveMove(Move move)
   - GetMatchHistory(Guid playerId)

2. Create InMemoryGameRepository for testing:
   - Thread-safe storage of game states
   - Move history tracking
   - Player statistics collection

3. Extend GameHub for reconnection:
   - HandleReconnection(): Send latest state on connect
   - PersistMoveAndState(): Save after each move
   - Handle server restart scenarios

4. Create persistence tests:
   - Test state save/load accuracy
   - Test reconnection scenarios
   - Test data consistency after server restart
   - Test concurrent access safety

This implements the persistence requirements from section 11.
Run tests: `dotnet test --filter "Persistence"`
