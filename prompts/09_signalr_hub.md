Implement the SignalR hub in BelieveOrNot.Server/:

1. Create GameHub.cs:
   - Implement CreateOrJoinMatch(CreateMatchRequest req)
   - Implement SubmitMove(SubmitMoveRequest req)
   - Handle SignalR groups for matches
   - Integrate with RulesEngine for move validation and application

2. Create GameService.cs:
   - Manage active matches in memory
   - Handle idempotent commands using ClientCmdId
   - Broadcast StateUpdate to all clients in match

3. Configure SignalR in Program.cs:
   - Add SignalR services
   - Map GameHub to /game endpoint
   - Configure CORS if needed

4. Create integration tests:
   - Test match creation and joining
   - Test move submission and broadcasting
   - Test idempotency behavior
   - Mock SignalR for testing

Run integration tests to verify hub functionality.
Run tests: `dotnet test --filter "Hub"`
