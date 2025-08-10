Create DTOs and contracts in BelieveOrNot.Shared/:

1. Create request DTOs:
   - CreateMatchRequest: GameConfig, PlayerNames
   - SubmitMoveRequest: MatchId, Move, ClientCmdId

2. Create response DTOs:
   - GameStateDto: All client-visible game state
   - PlayerDto: PlayerId, Name, HandSize, Score (no actual cards for others)
   - CardDto: Rank, Suit (for player's own hand only)

3. Create SignalR contracts:
   - IGameHubClient: StateUpdate method
   - IGameHub: CreateOrJoinMatch, SubmitMove methods

4. Create comprehensive tests:
   - Test DTO serialization/deserialization
   - Test data privacy (other players' cards not exposed)
   - Test all required fields are present

Ensure DTOs match the server-client contract in section 13.
Run tests: `dotnet test --filter "Dto"`
