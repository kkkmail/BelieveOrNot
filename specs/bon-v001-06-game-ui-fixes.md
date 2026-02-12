# Fix Game UI to Match Original Implementation

## Context
After the Phase 3 migration (SignalR to htmx+SSE), the game is functional but the UI has major discrepancies compared to the original JavaScript SPA. Cards are too small, unsorted, the joker is missing its label, the first-turn rank selector always shows (should appear only when cards are selected), the challenge flow is broken (button always visible vs. only after selecting a card to flip), and the card pile is a single emoji instead of a visual stack.

## Reference Files (Original Implementation)
- Card styling: `Server/wwwroot/styles/cards/base.css` (90x130px), `typography.css` (rank/suit fonts), `joker.css` (gradient bg)
- Card sort order: `Server/wwwroot/js/display/updateHandDisplay.js:18-36`
- Card rendering: `Server/wwwroot/js/display/updateHandDisplay.js:40-69` (rank div + suit div, joker shows JOKER text)
- First-turn logic: `Server/wwwroot/js/display/updateActionsDisplay.js:147-166` (rank selector hidden until cards selected)
- Challenge logic: `Server/wwwroot/js/display/handlePreviousCardClick.js` (toggle single card, show Flip button)
- Card pile: `Server/wwwroot/js/display/updateCardPileDisplay.js` (stacked card-back elements)
- Previous play: `Server/wwwroot/js/display/updatePreviousPlayDisplay.js` (face-down cards with ? rank + announced rank suit)
- Game board layout: `Server/wwwroot/game-board.html` (original HTML structure)

## Files to Modify (5 files, 0 new)

### Step 1: Sort cards and restructure card HTML
**File:** `Server/Pages/Bon/Partials/_Hand.cshtml`

Sort the hand server-side before rendering. Same sort as original `updateHandDisplay.js`:
- Jokers first
- Then by rank: 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, A
- Then by suit: Spades, Clubs, Diamonds, Hearts

Restructure card from single `<span class="card-face">text</span>` to two-part display:
```html
<label class="card card--spades" data-rank="K" data-suit="Spades">
    <input type="checkbox" name="cardIndices" value="@i" />
    <span class="card-face">
        <span class="card-rank">K</span>
        <span class="card-suit">♠</span>
    </span>
</label>
```
For jokers: rank = `🃏`, suit = `JOKER`, class = `card--joker`.

### Step 2: Rework action controls for first-turn and non-first-turn
**File:** `Server/Pages/Bon/Partials/_Actions.cshtml`

**First turn (opening play, no announced rank):**
- Replace `<select>` dropdown with rank buttons as radio inputs styled in a row:
  ```html
  <div class="rank-selector" hidden>
      <span>Declare Rank:</span>
      <div class="rank-buttons">
          @foreach rank: <label class="rank-btn"><input type="radio" name="declaredRank" value="rank"/><span>rank</span></label>
      </div>
  </div>
  ```
- Play button rendered but `hidden` initially; interaction.js shows it when cards selected
- Table message: "Select cards from your hand to play"
- When cards are selected (by interaction.js): rank-selector and play button are shown
- When all cards deselected: rank-selector and play button hide again

**Non-first turn (announced rank exists):**
- Hidden input `<input type="hidden" name="declaredRank" value="@AnnouncedRank" />`
- Message: "Select cards to play as **Rank** or click a card to challenge"
- Play button rendered but `hidden`; shown by JS when cards selected
- Button text updated to "PLAY N CARD(S) AS Rank"

**Challenge button (when CanChallenge):**
- Rendered but `hidden` initially
- Text: "Flip Selected Card" (matching original `confirmChallengeBtn`)
- ID: `challenge-btn` for JS targeting
- Shown by interaction.js only when a previous-play radio button is checked

### Step 3: Face-down cards use same size structure
**File:** `Server/Pages/Bon/Partials/_PreviousPlay.cshtml`

Use same card-face structure as hand cards:
```html
<label class="card card--facedown">
    <input type="radio" name="challengePickIndex" value="@i" />
    <span class="card-face">
        <span class="card-rank">?</span>
        <span class="card-suit">@Model.State.AnnouncedRank</span>
    </span>
</label>
```
The announced rank appears on the face-down card below the `?` (same pattern as original).

### Step 4: Improve card pile visual
**File:** `Server/Pages/Bon/Partials/_CardPile.cshtml`

Replace single emoji with stacked card-back elements:
- Render `min(tablePileCount, 15)` overlapping `.card-back` elements with inline `left` offsets
- Each card-back: small (60x90px), ornate gradient background matching original (`updateCardPileDisplay.js:72`)
- Below stack: "N cards" count text (already present)
- Empty state: "Empty" text in italic

### Step 5: Enhance interaction.js for play/challenge toggling
**File:** `Server/wwwroot/js/interaction.js`

Add to the existing IIFE, below the existing constraint enforcement:

**Card checkbox changes (play mode):**
- Listen for `change` on `#hand-area input[type="checkbox"]`
- Count checked checkboxes
- If count > 0:
  - Show `.rank-selector[hidden]` (remove hidden) if present (first turn only)
  - Show play button (remove hidden)
  - Update play button text: `PLAY ${count} CARD(S)`
  - Deselect any `#previous-play input[type="radio"]` (mutual exclusion with challenge)
  - Hide challenge button
  - Build card preview text from selected cards' data-rank + data-suit, show in `.table-message`
- If count === 0:
  - Hide rank-selector (add hidden) and play button (add hidden)
  - Reset `.table-message` to default text

**Previous-play radio changes (challenge mode):**
- Listen for `change` on `#previous-play input[type="radio"]`
- If a radio is checked:
  - Show challenge button (remove hidden)
  - Uncheck all `#hand-area input[type="checkbox"]` (mutual exclusion with play)
  - Hide rank-selector and play button
  - Update `.table-message`: "Challenge - card N selected"
- If none checked:
  - Hide challenge button

**Card-face click for radio toggle:**
- Radio buttons don't natively toggle off on re-click. Add a click handler on `.card--facedown .card-face` that toggles the associated radio and fires a change event.

**Reset after OOB swaps:**
- On `htmx:oobAfterSwap` for `#table-actions` or `#hand-area`, re-apply initial hidden states and constraints.

### Step 6: CSS updates
**File:** `Server/wwwroot/css/site.css`

**Card sizing (matching original 90x130):**
```css
.card-face {
    width: 90px;
    height: 130px;
    border: 3px solid #333;
    border-radius: 12px;
    background: #fff;
    font-weight: bold;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    padding: 4px;
    overflow: hidden;
}
.card-rank { font-size: clamp(36px, 3.5vw, 48px); line-height: 1; margin-bottom: 8px; }
.card-suit { font-size: clamp(24px, 2.5vw, 32px); line-height: 1; }
```

**Joker styling:**
```css
.card--joker .card-face { background: linear-gradient(45deg, #ff6b6b, #feca57); color: white; border-color: #ff6b6b; }
.card--joker .card-rank { font-size: clamp(48px, 4vw, 64px); margin-bottom: 12px; }
.card--joker .card-suit { font-size: clamp(18px, 1.8vw, 24px); font-weight: 600; margin-top: 8px; }
```

**Hover and selection states:**
```css
.card:hover .card-face { transform: translateY(-8px); box-shadow: 0 12px 25px rgba(0,0,0,0.3); }
.card input:checked + .card-face { border-color: #007bff; background: #e3f2fd; transform: translateY(-15px); }
```

**Face-down cards (same 90x130 size):**
```css
.card--facedown .card-face { background: #334155; color: #94a3b8; border-color: #475569; }
.card--facedown .card-rank { font-size: 2rem; }
.card--facedown .card-suit { font-size: 0.85rem; }
.card--facedown input:checked + .card-face { border-color: #dc2626; box-shadow: 0 0 0 2px #fca5a5; }
```

**Rank buttons:**
```css
.rank-selector { display: flex; align-items: center; gap: 8px; justify-content: center; flex-wrap: wrap; }
.rank-buttons { display: flex; gap: 4px; }
.rank-btn { cursor: pointer; }
.rank-btn input { position: absolute; opacity: 0; width: 0; height: 0; }
.rank-btn span { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border: 2px solid #6c757d; border-radius: 6px; font-weight: 700; font-size: 1rem; background: #fff; transition: all 0.15s; }
.rank-btn input:checked + span { background: #2563eb; color: #fff; border-color: #1d4ed8; }
.rank-btn:hover span { border-color: #2563eb; background: #eff6ff; }
```

**Card pile stack:**
```css
.card-pile-stack { position: relative; height: 90px; min-width: 80px; }
.card-back { position: absolute; top: 0; width: 60px; height: 90px; border-radius: 8px; border: 2px solid #5a6c7d; background: radial-gradient(circle at 30% 30%, rgba(116,185,255,0.4) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(187,143,206,0.4) 0%, transparent 50%), linear-gradient(135deg, #9bb0c1 0%, #8299b5 50%, #9bb0c1 100%); }
```

## Verification
1. `dotnet build Server -c Release` -- 0 errors
2. Run from `Server/bin/Release/net9.0/` directory
3. Test flow:
   - Create game (Player A) -> join (Player B) -> Start Round
   - **First turn (Player B):**
     - NO rank selector visible initially
     - Select 1-2 cards -> rank selector (buttons) + play button appear; preview text shown
     - Deselect all -> controls disappear
     - Select cards, choose rank, click play -> works
   - **Non-first turn (Player A):**
     - Message shows "Playing as Rank" context
     - Select cards -> play button appears (no rank selector)
     - Click previous-play card -> challenge button appears, card selection clears
     - Click Flip Selected Card -> challenge works
   - Cards sorted: Jokers first, then 2 to A, suits S/C/D/H
   - Cards are 90x130px with large rank+suit text
   - Joker shows emoji icon + "JOKER" text with gradient bg
   - Card pile shows stacked card-backs + count text
   - Face-down challenge cards are same 90x130 size
