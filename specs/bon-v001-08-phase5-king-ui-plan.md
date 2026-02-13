# Phase 5 — King UI Implementation Plan

## Context

Phase 4 (King Endpoints) is complete. The 7 POST endpoints and SSE endpoint are working, but return placeholder HTML from `KingViewRenderer`. Phase 5 replaces those placeholders with real Razor partials, making the King game fully playable via htmx+SSE at `/king`.

The approach mirrors Phase 3 (BelieveOrNot UI) exactly: same page structure, same OOB swap pattern, same `interaction.js` for card selection, same CSS conventions. King-specific differences: single card selection (radio, not checkbox), trump suit picker, trick display (4 card slots), 4-player fixed positions.

---

## Files to Create

### 1. `Server/Services/KingViewModel.cs`
View model wrapping `KingGameStateDto` with computed helper properties for Razor partials.

```csharp
public class KingViewModel
{
    public KingGameStateDto State { get; set; }
    public Guid YourPlayerId { get; set; }

    // Computed
    public bool IsCreator => State.Players.Count > 0 && State.Players[0].Id == YourPlayerId;
    public bool IsYourTurn => State.Players.Count > State.CurrentPlayerIndex
                              && State.Players[State.CurrentPlayerIndex].Id == YourPlayerId;
    public string? YourName => State.Players.FirstOrDefault(p => p.Id == YourPlayerId)?.Name;
    public string? CurrentPlayerName => ...;
    public bool CanPlay => Phase == InProgress && IsYourTurn && !WaitingForTrumpSelection
                           && (YourHand?.Count ?? 0) > 0;
    public bool CanSelectTrump => Phase == InProgress && WaitingForTrumpSelection && IsYourTurn;
    public bool IsGameComplete => State.CurrentRoundIndex >= match total rounds;
    // Lead suit for "must follow suit" card filtering
    public Suit? LeadSuit => State.CurrentTrick?.LedSuit;
    // Playable cards: filter hand based on must-follow-suit, hearts restriction, etc.
    // (computed in view model to emit data-selectable-suits on hand area)
}
```

### 2. `Server/Pages/King/Index.cshtml` — Page at `/king`
Mirrors `Server/Pages/Bon/Index.cshtml`. Structure:
- Help modal dialog (King rules)
- `.page-container`
  - `.top-controls` — connection badge, help button, "OTHER GAMES" link, `#king-management-controls`
  - `.game-header` — "King" title
  - `#king-game-setup` — Create/Join form (settings: include "avoid everything" round, collecting phase rounds)
  - `.game-board-panel` with `hx-ext="sse"` — all King region placeholder divs:
    - `#king-sse-container`, `#king-game-status`, `#king-players`, `#king-trump-display`
    - `#king-trick`, `#king-hand`, `#king-actions`, `#king-trump-select`
    - `#king-round-info`, `#king-scores`, `#king-event-log`
    - `#king-management`, `#king-final-results`
- Inline `<script>`: auto-reconnect via `?match=` query param, player name cookie

### 3. Razor Partials (`Server/Pages/King/Partials/`)

| Partial | Region ID | Purpose |
|---|---|---|
| `_SseContainer.cshtml` | `king-sse-container` | SSE connection (same pattern as Bon) |
| `_ConnectionStatus.cshtml` | `king-connection-status` | "Connected" badge |
| `_SetupForm.cshtml` | `king-game-setup` | Replaced on create/join (hides form, shows game) |
| `_GameStatus.cshtml` | `king-game-status` | Phase, round X of Y, round name, current turn, trump suit, match ID |
| `_Players.cshtml` | `king-players` | 4 player cards (name, hand count, tricks won, score, turn indicator) |
| `_Trick.cshtml` | `king-trick` | Current trick: 4 card slots arranged in a cross, cards face-up |
| `_Hand.cshtml` | `king-hand` | Your hand with **radio buttons** (single select), `data-max-select="1"` |
| `_Actions.cshtml` | `king-actions` | Play button (hidden until card selected + your turn), message |
| `_TrumpSelect.cshtml` | `king-trump-select` | 4 suit buttons (Spades/Clubs/Diamonds/Hearts) shown only when `CanSelectTrump` |
| `_RoundInfo.cshtml` | `king-round-info` | Round name, description, scoring rules, special rules |
| `_Scores.cshtml` | `king-scores` | Score table sorted by score, tricks won this round |
| `_EventLog.cshtml` | `king-event-log` | Empty placeholder (populated by SSE game-event) |
| `_Management.cshtml` | `king-management` | Start Round button (creator, 4 players, WaitingForPlayers/RoundEnd phase) |
| `_ManagementControls.cshtml` | `king-management-controls` | End Round button (creator, in-progress phase), End Game button |
| `_FinalResults.cshtml` | `king-final-results` | Game over overlay |
| `_TrumpDisplay.cshtml` | `king-trump-display` | Small trump card indicator (suit symbol + color) |

### 4. Update `Server/Services/KingViewRenderer.cs`
Replace placeholder implementation with real Razor rendering (mirror `BonViewRenderer.cs`):
- Inject `IRazorPartialRenderer`, `IKingGameEngine`
- `BuildViewModel(match, playerId)` creates `KingViewModel`
- `RenderAllRegionsAsync` renders all partials
- `RenderStateUpdateAsync` renders all except `_SseContainer` and `_EventLog`
- `RenderEventLogEntryAsync` and `RenderFinalResultsAsync` stay as inline HTML (no change)

### 5. Update `Server/wwwroot/js/interaction.js`
Add King-specific handling:
- Card selection in `#king-hand` uses radios (single select) — existing radio handling already works
- Hidden input in `#king-card-order` for selected card rank+suit
- Play button in `#king-actions` shown when a card is selected and it's your turn
- Reset on OOB swaps for `king-actions`, `king-hand`
- Trump selection uses regular buttons with `hx-post`, no JS needed

### 6. Update `Server/wwwroot/css/site.css`
Add King-specific CSS sections:
- King page background (orange gradient like old UI)
- King trick display (4 card slots in cross layout)
- King trump display (small card indicator)
- King trump selection buttons (4 suit buttons with suit colors)
- King round info panel
- King players layout (reuse `.player-card` pattern)
- Reuse existing card, button, scoring, event-log styles

### 7. Update `Server/Pages/_ViewImports.cshtml`
Add `@using global::BelieveOrNot.Server.King` so Razor partials can use King types.

---

## Files to Modify

| File | Change |
|---|---|
| `Server/Services/KingViewRenderer.cs` | Replace placeholders with real Razor rendering |
| `Server/wwwroot/js/interaction.js` | Add King hand/action handlers |
| `Server/wwwroot/css/site.css` | Add King-specific styles |
| `Server/Pages/_ViewImports.cshtml` | Add King namespace |

## Key Differences from BelieveOrNot UI

| Aspect | BelieveOrNot | King |
|---|---|---|
| Card selection | Multi-select checkboxes (1-3) | Single-select radio (exactly 1) |
| Declared rank | Radio buttons for rank | N/A (no rank declaration) |
| Challenge | Pick face-down card to flip | N/A (no challenges) |
| Trump | N/A | 4 suit buttons (collecting rounds only) |
| Trick display | Face-down pile | 4 face-up card slots |
| Players | Variable count | Exactly 4 |
| Scoring | Per-round with bonuses | Per-trick with round types |
| Card pile | Accumulating pile | N/A (no pile) |
| Card restrictions | None (play any card) | Must follow suit, hearts rule, trump rule |

## Card Restriction Implementation

Server-side `KingMoveValidator` validates on submit. For client-side UI hints:
- `data-selectable-suits` on `#king-hand` to gray out unplayable suits
- Computed in `KingViewModel`: if leading, all suits (unless hearts restricted); if following, only lead suit if player has it, else trump suit if collecting + has trump, else all suits
- `interaction.js` already supports `data-selectable-suits` filtering

## Design Decisions

1. **Single-select radios for cards**: `data-max-select="1"` + radio inputs. `interaction.js` already enforces max-select and supports radio buttons.

2. **Trick display as cross layout**: 4 `.trick-slot` divs positioned top/right/bottom/left inside a relative container. Each shows the card played by that position's player, or empty.

3. **Trump selection as direct POST buttons**: Each suit button is a standalone `hx-post="/king/select-trump"` with `hx-vals`. No JS needed — htmx handles it.

4. **Card rank+suit in form data**: Radio labels store `data-rank` and `data-suit`. On selection, JS writes hidden inputs `cardRank` and `cardSuit` into `#king-card-order`.

5. **Reuse existing card CSS**: Same `.card`, `.card--hearts`, etc. classes. King cards just use radio inputs instead of checkboxes.

6. **Playable card filtering**: `KingViewModel` computes which suits are playable based on trick state and round rules, emits as `data-selectable-suits` attribute. `interaction.js` already grays out non-selectable suits.

---

## Verification

1. `dotnet build -c Release` — 0 errors, 0 warnings
2. Browser: Navigate to `http://127.0.0.1:44999/king`
   - Setup form visible, can create game
   - Join with match ID works
   - Reconnect on page reload works
3. Full 4-player game flow:
   - 4 players join (4 browser tabs)
   - Creator starts round → cards dealt, round info shown
   - Avoiding round: cards playable, must follow suit enforced
   - Trick completes after 4 cards, winner shown
   - Round ends after 8 tricks, scores updated
   - Collecting round: trump selection shown for dealer
   - Dealer selects trump → game continues
   - Game ends after all rounds
4. SSE: state updates push to all 4 players in real-time
5. Old King frontend at `/king/index.html` still works via SignalR
6. `interaction.js` handles single card select, play button show/hide
7. Update `specs/bon-v001-03-migration-progress.md` — mark Phase 5 items complete
