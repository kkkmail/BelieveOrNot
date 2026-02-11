# Fix 8 Game Board Layout Issues

## Context
After completing Phase 3 (BelieveOrNot UI), the game is functional but has major visual discrepancies compared to the original implementation. The front page has been approved. This plan addresses all 8 game board layout issues identified by comparing screenshots of the original vs current implementation.

## Issues Summary
1. Match ID section outside white panel (should be in status bar)
2. End Game/End Round buttons misplaced (should be in top-right controls)
3. Status bar content wrong (needs phase heading, Round, Turn, Rank, Cards, Match ID + copy)
4. Missing "Table" area (green dashed border, Last Play left, Card Pile right, table controls)
5. Missing "Your Hand (X cards)" heading (already exists in partial, needs CSS fix)
6. Scores use flat HTML table (should be flex card boxes)
7. Help collapsible visible in game board (should be empty, help is via ? modal)
8. Player cards too small/minimal (need larger cards, green active border, pulse animation)

## Implementation Plan (13 files, 1 new)

### Step 1: Restructure `Index.cshtml`
**File**: `Server/Pages/Bon/Index.cshtml`

Add `<div id="management-controls"></div>` inside `.top-controls` (for End Game/End Round).
Wrap `#previous-play`, `#card-pile`, `#table-actions`, `#game-management` inside a `<div class="table-area">` with `<h3>Table</h3>` and `<div class="table-display">` for the side-by-side layout. Move `#hand-area` after the table area. OOB swaps still work because htmx finds targets by ID anywhere in the DOM.

### Step 2: Create `_ManagementControls.cshtml` (NEW)
**File**: `Server/Pages/Bon/Partials/_ManagementControls.cshtml`

New partial rendering End Game/End Round buttons into `#management-controls` in the top-right area. Only shown to the game creator.

### Step 3: Register new partial in `BonViewRenderer.cs`
**File**: `Server/Services/BonViewRenderer.cs`

Add `_ManagementControls.cshtml` to `AllPartials` array. `StateUpdatePartials` auto-derives from it.

### Step 4: Simplify `_GameManagement.cshtml`
**File**: `Server/Pages/Bon/Partials/_GameManagement.cshtml`

Keep only Start Round button (shown during WaitingForPlayers and RoundEnd). Remove End Round/End Game (now in `_ManagementControls`).

### Step 5: Empty `_SetupForm.cshtml`
**File**: `Server/Pages/Bon/Partials/_SetupForm.cshtml`

After create/join, render empty `#game-setup` div. Match info moves to `_GameStatus`.

### Step 6: Rewrite `_GameStatus.cshtml`
**File**: `Server/Pages/Bon/Partials/_GameStatus.cshtml`

Gray rounded box with `<h2>` phase text, `.status-info` flex row showing: Round, Current Turn, Announced Rank, Table Cards, Match ID + Copy button (inline `navigator.clipboard.writeText()` onclick).

### Step 7: Rewrite `_Scores.cshtml`
**File**: `Server/Pages/Bon/Partials/_Scores.cshtml`

Replace HTML `<table>` with `.scoring-area` wrapper and `.score-items` flex container with `.score-item` white cards. Each card shows player name and score.

### Step 8: Update `_PreviousPlay.cshtml`
**File**: `Server/Pages/Bon/Partials/_PreviousPlay.cshtml`

Wrap in `.previous-play-section` (300px, flex-shrink 0) with "Last Play" label, face-down cards, and play info text. Empty state uses CSS `::after` pseudo-element.

### Step 9: Update `_CardPile.cshtml`
**File**: `Server/Pages/Bon/Partials/_CardPile.cshtml`

Wrap in `.table-pile-section` (flex:1) with "Card Pile" label, dashed green border container, and card count text.

### Step 10: Update `_Actions.cshtml`
**File**: `Server/Pages/Bon/Partials/_Actions.cshtml`

Wrap in `.table-controls` (blue border) with `.table-message` ("Your turn!" / "Waiting for X...") and `.table-actions` flex container. Add `challenge-mode` and `active-turn` CSS classes.

### Step 11: Update `_Players.cshtml`
**File**: `Server/Pages/Bon/Partials/_Players.cshtml`

Change wrapper from `.players-list` to `.players-area` (flex, space-around, 20px gap). Change active class from `player-card--active` to `current-turn` (green border, scale, pulse animation).

### Step 12: Empty `_Help.cshtml`
**File**: `Server/Pages/Bon/Partials/_Help.cshtml`

Render empty `#help-content` div. Help already accessible via `<dialog>` modal.

### Step 13: Major CSS rewrite in `site.css`
**File**: `Server/wwwroot/css/site.css`

All CSS changes in one step:
- **Game Status**: Replace `.game-status-bar` (dark) with `.game-status` (gray rounded), `.status-info` (flex row), `.match-id-section`, `.btn-copy`
- **Players**: Replace `.players-list` with `.players-area` (space-around, 20px gap). Larger `.player-card` (150px min, 20px padding, shadow). `.current-turn` (green border, scale 1.05, pulse-glow)
- **Table Area**: `.table-area` (green dashed border), `.table-display` (flex, 180px min-height), `.previous-play-section` (300px), `.table-pile-section` (flex:1), labels, empty states with `::after`
- **Card Pile**: Green dashed inner border, 140px height
- **Table Controls**: `.table-controls` (blue border), `.table-message`, `.table-actions` (flex centered). Challenge mode (yellow), active turn (pulse)
- **Scores**: `.scoring-area` (gray bg), `.score-items` (flex, space-around), `.score-item` (white card boxes). Scope old `.score-table` to `.final-results-content` only
- **Event Log**: Teal left border, 200-300px height, scrollable, custom scrollbar
- **Management**: `.game-management` (inside table area), `.game-management-controls` (inside top-controls)
- **Hand**: Center `.hand` cards with `justify-content: center`
- **Animations**: `@keyframes pulse-glow`, `@keyframes blink`
- **Empty divs**: Add `#management-controls:empty` rule
- **Responsive**: Stack table-display, status-info, players, scores vertically on mobile
- **Hide table area when empty**: `.table-area:not(:has([id]:not(:empty))) { display: none; }`

## Verification
1. Build: `dotnet build Server -c Release`
2. Run from `Server/bin/Release/net9.0/` directory
3. Test flow: Create game -> verify status bar with Match ID + copy -> join with 2nd browser -> Start Round -> Play cards -> Challenge -> End Round -> End Game
4. Check: green table area, side-by-side Last Play / Card Pile, blue table controls, score cards, event log styling, player pulse animation, top-right End Game button, help section hidden
5. Mobile: resize browser to verify responsive stacking
