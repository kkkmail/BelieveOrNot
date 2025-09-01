Implement challenge resolution logic in BelieveOrNot.Core/Engine/:

1. Create ChallengeResolver.cs:
   - ResolveChallenge(GameState state, int challengeIndex): Returns resolution result
   - Handle hit (truthful) vs miss (lie) scenarios
   - Determine who collects the table pile
   - Clear table pile and announced rank after collection

2. Extend RulesEngine to use ChallengeResolver:
   - Integrate challenge resolution into ApplyMove
   - Handle turn sequence reset after collection
   - Ensure next player (left of collector) gets opening turn

3. Create comprehensive tests:
   - Test challenge hit scenarios (challenger collects)
   - Test challenge miss scenarios (previous player collects)
   - Test table pile collection mechanics
   - Test turn sequence reset
   - Test edge cases (empty pile, invalid indices)

Verify challenge resolution follows section 6 of the spec exactly.
Run tests: `dotnet test --filter "Challenge"`
