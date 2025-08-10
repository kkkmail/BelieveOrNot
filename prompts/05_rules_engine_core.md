Implement the core rules engine in BelieveOrNot.Core/Engine/:

1. Create IRulesEngine.cs interface:
   - ValidateMove(GameState state, Move move): Returns validation result
   - ApplyMove(GameState state, Move move): Returns new state
   - CalculateRoundScoring(GameState state): Returns score changes

2. Create RulesEngine.cs implementation:
   - Implement opening turn validation (must set announced rank)
   - Implement subsequent play validation (must match announced rank claim)
   - Implement challenge validation (table pile must be non-empty)
   - Handle four-of-a-kind auto-disposal
   - Implement round end detection

3. Create RulesEngineTests.cs with comprehensive test coverage:
   - Test opening turn scenarios
   - Test valid/invalid play moves
   - Test challenge scenarios
   - Test four-of-a-kind disposal
   - Test round end conditions
   - Use deterministic seeds for reproducible tests

Ensure all validation rules from sections 5-6 of the spec are implemented.
Run tests: `dotnet test --filter "RulesEngine"`
