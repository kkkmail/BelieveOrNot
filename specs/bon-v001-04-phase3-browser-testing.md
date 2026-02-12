# Phase 3 Browser Testing — Summary of Changes

**Date**: 2026-02-11 to 2026-02-12
**Scope**: UI fixes after Phase 3 migration (SignalR → htmx+SSE)

---

## Overview

After completing Phase 3 (all Razor partials rendering correctly, curl-tested), browser testing revealed major UI discrepancies vs. the original JS SPA. This document captures all changes made during iterative testing and the lessons learned.

---

## Files Modified

### Server-Side (C#)

| File | Changes |
|------|---------|
| `Services/BonViewModel.cs` | Added: `IsYourLastPlay`, `HasChallengeResult`, `MustChallenge`, `IsYouChallengedPlayer` |
| `BelieveOrNot/GameStateDto.cs` | Added: `LastPlayedCards` (personalized list), `ChallengeResult` (ChallengeEventData) |
| `BelieveOrNot/Match.cs` | Added: `LastChallengeResult` field |
| `BelieveOrNot/GameEngine_CreateGameStateDto.cs` | Populates `LastPlayedCards` (only for player who played them), `ChallengeResult` |
| `BelieveOrNot/GameEngine_HandlePlayAction.cs` | Clears `match.LastChallengeResult = null` at start of each play |
| `BelieveOrNot/GameEngine_HandleChallengeAction.cs` | Stores `match.LastChallengeResult`; skips `AutoDisposeFourOfAKind` when round is ending |
| `BelieveOrNot/GameEngine_EndRound.cs` | Clears all player hands after scoring |
| `Endpoints/BonEndpoints.cs` | Removed `excludePlayerId` from `BroadcastStatesAsync` — all players now receive SSE |

### Razor Partials

| File | Changes |
|------|---------|
| `_Hand.cshtml` | Server-side sort (Jokers→rank→suit); restructured card HTML (`card-rank`/`card-suit` spans); `data-card-index` checkboxes (no `name`); `#card-order` div for hidden inputs; `.card-order-badge` spans; only emits `data-max-select` when `CanPlay` |
| `_Actions.cshtml` | Rank radio buttons (replaced dropdown); play/challenge buttons start `hidden`; `MustChallenge` branch; `hx-include` targets `#card-order`; differentiated messages for creator vs non-creator |
| `_PreviousPlay.cshtml` | Three display modes: (1) challenge result with CSS flip animation, (2) normal last play face-up/face-down, (3) empty |
| `_CardPile.cshtml` | Visual card-back stack (up to 15 overlapping `.card-back` divs) replacing single emoji |

### Client-Side

| File | Changes |
|------|---------|
| `wwwroot/js/interaction.js` | Card selection order tracking (`selectionOrder` array); `rebuildCardOrderInputs()`/`updateOrderBadges()`; play/challenge mutual exclusion toggle; radio toggle-off support; `resetControls()` on OOB swaps |
| `wwwroot/css/site.css` | `[hidden]` override; cards 90×130px; joker gradient; hover/checked transforms; rank button styles; card pile stack; challenge flip animation; `.card-order-badge` positioning |

---

## Architecture Patterns Established

### interaction.js Structure (IIFE)
The file is a single IIFE with these sections:
1. **Constraint enforcement** — `applyConstraints()` reads `data-max-select`, `data-selectable-suits`, `data-selectable-ranks` from containers and disables/enables checkboxes
2. **Card selection order** — `selectionOrder[]` array tracks click order; `rebuildCardOrderInputs()` creates hidden inputs in `#card-order`; `updateOrderBadges()` shows numbered badges (1,2,3) on cards
3. **Play/challenge toggling** — selecting hand cards shows play button + rank selector (first turn); selecting previous-play radio shows challenge button; mutual exclusion between the two modes
4. **Radio toggle-off** — `lastCheckedRadio{}` tracking enables clicking a radio again to uncheck it (native HTML doesn't support this)
5. **Event listeners** — `change` handler for constraints + card selection + rank + challenge; `click` for radio toggle-off; `htmx:afterSwap` and `htmx:oobAfterSwap` for reset

### Card Selection Order Flow
1. Checkboxes have `data-card-index="N"` (no `name` attribute — they're visual-only)
2. On check: `selectionOrder.push(cardIndex)`
3. On uncheck: `selectionOrder.splice(pos, 1)` (removes and re-numbers)
4. `rebuildCardOrderInputs()` creates `<input type="hidden" name="cardIndices" value="N">` in `#card-order` div, in selection order
5. `_Actions.cshtml` uses `hx-include="#card-order input[name='cardIndices']"` to submit in order
6. Numbered badges appear on selected cards showing play order

### Challenge Result Data Flow
1. `HandleChallengeAction` creates `ChallengeEventData` with `RevealedCard`, `IsMatch`, `RemainingCards`, etc.
2. Stored on `match.LastChallengeResult`
3. Included in `GameStateDto.ChallengeResult` for all players
4. `_PreviousPlay.cshtml` renders differently based on `HasChallengeResult`:
   - **Challenged player**: sees all cards face-up, picked card highlighted with yellow border
   - **Other players**: sees CSS flip animation (card flips to reveal face), verdict badge (✓/✗), remaining cards revealed sequentially if challenger lost
5. Cleared by `HandlePlayAction` setting `match.LastChallengeResult = null`

### Personalized State: LastPlayedCards
- `CreateGameStateDto` populates `LastPlayedCards` only when `requestingPlayerId == match.Players[LastActualPlayerIndex].Id`
- The player who played sees their cards face-up in `_PreviousPlay`
- Other players see face-down cards with radio buttons for challenge selection

### SSE Broadcast (Critical Fix)
- `BroadcastStatesAsync` sends to ALL players — no exclusion of the acting player
- Acting player's HTTP response still contains OOB HTML (redundant backup)
- OOB swaps via `hx-swap="none"` on action buttons are unreliable
- SSE is the primary state delivery channel for all players

---

## Bugs Fixed

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| Rank selector visible when no cards selected | CSS `display: flex` overrides HTML `hidden` attribute | Added `[hidden] { display: none !important; }` |
| Non-active players' cards re-enabled | `applyConstraints()` `else { cb.disabled = false }` re-enables server-disabled checkboxes | Only emit `data-max-select` when `CanPlay` is true |
| Game stuck after play action | Acting player excluded from SSE; HTTP response OOB not processed | Include acting player in SSE broadcast |
| `MustChallenge` too aggressive | Triggered whenever any player had 0 cards | Changed to `Players.Count(p => p.HandCount > 0) == 1` |
| Hand cards shown after round end | Hand partial rendered cards regardless of phase | Added `Phase == InProgress` check |
| Auto-dispose on round end | 4-of-a-kind disposal ran even when round was ending | Check `roundEnding` before `AutoDisposeFourOfAKind` |
| Cards submitted in DOM order | htmx `hx-include` collects checkbox values in DOM order | JS-managed hidden inputs in selection order |

---

## Next Step

Phase 3 browser testing is complete. Next: **Phase 4 — King Endpoints** (see migration progress tracker).
