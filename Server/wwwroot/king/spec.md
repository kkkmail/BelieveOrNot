# The King Card Game - Specification

## Overview
The King is a popular Russian card game. The name comes from the King of Hearts card, which plays a special role in the game.

## Basic Game Setup

### Players
- **4 players only**

### Deck
- **Standard deck**: 32 cards (7, 8, 9, 10, J, Q, K, A in all suits)
- **Card ranking**: 7 (lowest) to Ace (highest) in each suit
- **Special card**: King of Hearts (called "The King")

### Deal
- Each player gets 8 cards
- Cards are dealt once at the beginning of each round

## Game Structure

### Two Main Phases
1. **Avoiding Phase** - Players try to avoid certain cards/tricks and get negative points
2. **Collecting Phase** - Players try to collect tricks and get positive points

### Phase 1: Avoiding Phase (6 or 7 rounds)

Each round has specific avoidance conditions:

1. **Don't take tricks** (-2 points per trick taken)
   - **Early termination**: Round ends when all 8 tricks are taken
   
2. **Don't take Hearts** (-2 points per Heart card taken)
   - **Special rule**: Cannot lead with Hearts unless no other suit available
   - **Early termination**: Round ends when all 13 Hearts cards are taken
   
3. **Don't take Boys** (-2 points per Jack or King taken)
   - **Early termination**: Round ends when all 8 Boys (4 Jacks + 4 Kings) are taken
   
4. **Don't take Queens** (-4 points per Queen taken)
   - **Early termination**: Round ends when all 4 Queens are taken
   
5. **Don't take the last 2 tricks** (-8 points for each of the last 2 tricks)
   - **No early termination**: All 8 tricks must be played
   
6. **Don't take the King of Hearts** (-16 points if taken)
   - **Special rule**: Must discard King of Hearts when possible (when you cannot follow suit)
   - **Early termination**: Round ends when the King of Hearts is taken
   
7. **Don't take anything** (-96 points total; combines all previous penalties) **[OPTIONAL]**
   - **Default**: Not included in game (checkbox on start game page, unchecked by default)
   - **No early termination**: All 8 tricks must be played

### Phase 2: Collecting Phase (4 or 8 rounds)

Players try to collect tricks for positive points:
- **+3 points per trick taken**
- **Default**: 8 rounds total (each player gets 2 opportunities to set trump)
- **Option**: 4 rounds (each player gets 1 opportunity to set trump)
- **24 positive points available per round** (8 tricks × 3 points)
- **Trump selection**: Each player chooses trump suit when it's their turn
- **No early termination**: All 8 tricks must be played each round

## Game Settings (Start Game Page Options)

- **Include "Don't take anything" round**: Checkbox (default: unchecked)
- **Collecting Phase rounds**: Choice between 4 or 8 rounds (default: 8)

## Basic Game Flow

1. **Deal Phase**: Distribute 8 cards to each player
2. **Round Play**: Follow trick-taking rules with specific avoidance/collection goals
3. **Scoring**: Calculate points based on current round type
4. **Early Termination**: Check if round can end early (when applicable)
5. **Next Round**: Continue through all rounds in sequence
6. **Game End**: Player with highest total score wins

## Trick-Taking Rules

- **Following suit**: Must follow suit if possible
- **Leading**: Winner of previous trick leads next
- **Trick**: A set of 4 cards (one from each player) that goes to one player
- **First player rotation**: At the start of each new round, the first player shifts by one position clockwise
- **First round**: First player is assigned randomly
- **Special Hearts rule**: Cannot lead with Hearts in "Don't take Hearts" round unless no other suit available
- **King of Hearts rule**: Must discard King of Hearts when you cannot follow suit in avoiding rounds

## Collecting Phase Trump Rules

- **Trump selection**: Each player chooses trump suit when it's their turn to lead the round
- **Trump order**: Players take turns in rotation (each gets equal opportunities)
- **Trump power**: Trump cards beat all non-trump cards regardless of rank
- **Trump vs Trump**: Higher rank wins when both cards are trump

## UI Requirements

- **Card display**: Show player hands and table
- **Score tracking**: Display current scores and round type  
- **Round indicator**: Show which type of round is being played and current round number
- **Trump indicator**: Show current trump suit during Collecting Phase
- **Game log**: Track important moves and penalties
- **Early termination notice**: Indicate when a round ends early

## Technical Considerations

- **Real-time multiplayer**: 4 players in same game
- **Turn management**: Ensure proper turn order
- **Score calculation**: Accurate point tracking across rounds
- **Rule enforcement**: Prevent illegal moves (Hearts leading, King holding)
- **Early termination logic**: Implement round ending conditions
- **Trump handling**: Manage trump suit selection and card comparison