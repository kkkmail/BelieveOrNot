Implement the DeckBuilder service in BelieveOrNot.Core/Services/:

1. Create DeckBuilder.cs with methods:
   - BuildDeck(GameConfig config): Returns List<Card>
   - Support for 32-card deck: {7,8,9,10,J,Q,K,A} x 4 suits
   - Support for 36-card deck: {6,7,8,9,10,J,Q,K,A} x 4 suits  
   - Support for 54-card deck: Standard 52-card + special handling
   - Add specified number of Jokers

2. Create ShuffleService.cs:
   - Shuffle(List<Card> cards, int? seed = null): For deterministic testing
   - Use Fisher-Yates algorithm

3. Create comprehensive tests in BelieveOrNot.Tests/Services/:
   - Test each deck size produces correct card count
   - Test joker addition
   - Test deterministic shuffling with seeds
   - Test edge cases (0 jokers, maximum jokers)

Verify deck contents match specification requirements exactly.
Run tests: `dotnet test --filter "DeckBuilder"`
