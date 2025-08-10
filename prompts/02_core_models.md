Implement the core domain models in BelieveOrNot.Core/Models/ based on the specification:

1. Create Card.cs:
   - Properties: Rank (string), Suit (enum with Hearts, Diamonds, Clubs, Spades)
   - Special rank "Joker" support
   - Proper equality comparison
   - ToString() for debugging

2. Create Player.cs:
   - Properties: PlayerId (Guid), Name (string), Hand (List<Card>), Score (int)
   - Methods: AddCards(), RemoveCards(), HasFourOfAKind(), CanDisposeJokers()

3. Create GameConfig.cs:
   - Properties: DeckSize (32/36/54), JokerCount, JokerDisposalEnabled
   - Scoring weights: ScorePerCard, ScorePerJoker, WinnerBonus
   - InviteTimeoutSeconds

4. Create enums:
   - ActionType: Play, Challenge
   - GamePhase: WaitingForPlayers, InProgress, RoundEnd, GameEnd

5. Create comprehensive unit tests for all models in BelieveOrNot.Tests/Models/
   - Test card equality and comparison
   - Test player hand operations
   - Test four-of-a-kind detection
   - Test configuration validation

Run tests after implementation: `dotnet test`
