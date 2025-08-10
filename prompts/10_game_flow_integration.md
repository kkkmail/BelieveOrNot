Create end-to-end integration tests in BelieveOrNot.Tests/Integration/:

1. Create GameFlowTests.cs:
   - Test complete round flow: deal -> plays -> challenges -> scoring
   - Test multiple rounds with dealer rotation
   - Test various player counts (2, 3, 4+ players)
   - Test different deck configurations

2. Create realistic game scenarios:
   - TestSuccessfulBluff(): Player lies and isn't caught
   - TestFailedBluff(): Player lies and is caught
   - TestMultipleRounds(): Complete game with scoring
   - TestFourOfAKindDisposal(): Auto-disposal scenarios

3. Use deterministic seeds for reproducible tests:
   - Set up known card distributions
   - Verify exact expected outcomes
   - Test edge cases and boundary conditions

4. Performance tests:
   - Test large numbers of moves
   - Test concurrent match handling
   - Verify memory usage patterns

Run full test suite and ensure all acceptance criteria are met.
Run tests: `dotnet test`
