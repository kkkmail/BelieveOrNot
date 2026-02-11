# BelieveOrNot — Migration Spec: SignalR + Vanilla JS → htmx + Razor + SSE

## 1) Goal

Replace the current frontend (110 JS files, 34 CSS files, SignalR) with the authoritative tech stack defined in `bon-v001-01-authoritative_ui_stack.md`:
- **htmx** for interactivity (player actions via HTTP POST, server pushes via SSE)
- **Razor Pages / Partials** for all HTML rendering
- **SSE** for server-initiated updates to all players
- **Single CSS file** with layout primitives
- **Zero custom JavaScript**

The backend game logic (`GameEngine`, `MatchManager`, `KingGameEngine`, `KingMatchManager`, `Shared/`) is **not migrated** — only the communication layer (hubs → endpoints + SSE) and the presentation layer (JS + static HTML → Razor).

---

## 2) Migration Strategy

### Principle: parallel build, then switch

The old static-file frontend and the new Razor frontend coexist during migration. They serve from different URL paths. This keeps the app buildable and testable at every step.

- **Old frontend**: continues to work at `/index.html` (static files)
- **New frontend**: built at `/bon` (Razor Pages) and `/king` (Razor Pages)
- **Switchover**: once the new frontend is complete, the root `/` is remapped to the new Razor page and old static files are deleted

### Migration order

1. **Phase 1 — Foundation**: Razor Pages, SSE infrastructure, htmx, single CSS file
2. **Phase 2 — BelieveOrNot endpoints**: convert hub methods to HTTP POST endpoints
3. **Phase 3 — BelieveOrNot UI**: build Razor partials for each UI region
4. **Phase 4 — King endpoints**: convert King hub methods to HTTP POST endpoints
5. **Phase 5 — King UI**: build Razor partials for King UI regions
6. **Phase 6 — Switchover & cleanup**: remap root, delete old files

Each phase is a checkpoint. The app must build and the new pages must render correctly before proceeding.

---

## 3) Phase 1 — Foundation

### 3.1 Enable Razor Pages

Modify `Program.cs`:
- Add `builder.Services.AddRazorPages()`
- Add `app.MapRazorPages()`
- Keep existing static file serving (old frontend still works)

Create folder structure:
```
Server/
  Pages/
    Bon/
      Index.cshtml          ← full page for BelieveOrNot
      _Layout.cshtml        ← shared layout (htmx script, CSS link)
      Partials/             ← all BelieveOrNot fragments
    King/
      Index.cshtml          ← full page for King
      Partials/             ← all King fragments
    Shared/
      _ViewImports.cshtml
      _ViewStart.cshtml
```

### 3.2 Add htmx

Reference htmx from CDN (or vendor a local copy in `wwwroot/lib/`):
- `htmx.min.js`
- `htmx-ext-sse.js` (SSE extension)

Include in `_Layout.cshtml`.

### 3.3 Player ID via cookie

Player identity persists via a server-set cookie (replaces the current `localStorage` approach in JS):
- On first visit (no cookie), the server generates a new `Guid` and sets it as an `HttpOnly` cookie named `PlayerId`
- On subsequent requests, the server reads `PlayerId` from the cookie
- The cookie is included automatically in all HTTP POST requests and the SSE connection
- No JavaScript involvement in player identity

Implement as middleware or inline in `Program.cs`.

### 3.4 Build SSE infrastructure

Create `Server/Sse/` folder:

**`SseConnectionManager.cs`** — manages per-player SSE connections:
- `ConcurrentDictionary<PlayerId, SseConnection>` where `SseConnection` holds the `HttpResponse` stream
- Methods: `AddConnection`, `RemoveConnection`, `GetConnectionsForMatch`
- Group management: track which players belong to which match

**`SseMiddleware.cs`** or endpoint — SSE connection endpoint:
- `GET /bon/sse?matchId={matchId}&playerId={playerId}` — opens SSE stream
- Sets headers: `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`
- Keeps response stream open
- On disconnect: remove from `SseConnectionManager`

**`SseBroadcaster.cs`** — sends HTML fragments to players:
- Method: `SendToPlayer(playerId, eventName, htmlFragment)`
- Method: `SendToMatch(matchId, Func<playerId, htmlFragment>)` — sends personalized HTML per player
- Writes SSE format: `event: {eventName}\ndata: {html}\n\n`

Register as singletons in `Program.cs`.

### 3.5 Create `interaction.js`

Create `wwwroot/js/interaction.js` — the single permitted JS file beyond htmx.

This script enforces **server-driven** pre-submission constraints by reading `data-*` attributes from server-rendered HTML. It contains no game logic — all rules come from the server via these attributes.

Responsibilities:
- Read `data-max-select`, `data-min-select`, `data-selectable-suits`, `data-selectable-ranks`, `data-select-mode` from container elements
- Disable checkboxes/radio buttons when max selection reached
- Disable cards that don't match allowed suits/ranks
- Update counter text (e.g. "2 of 3 selected")
- Enable/disable submit buttons based on min selection
- Listen to `htmx:afterSwap` to re-apply constraints when SSE pushes new HTML (new `data-*` values arrive with the new partial)

Include in `_Layout.cshtml` after htmx.

See `bon-v001-01-authoritative_ui_stack.md` § "Interaction Script Rules" for strict boundaries and the full `data-*` constraint vocabulary.

### 3.6 Create single CSS file

Create `wwwroot/css/site.css` with:
- Layout primitives: `.row`, `.stack`, `.grid`
- Base reset / typography
- Card styles (port from existing `styles/cards/`)
- Component styles (buttons, forms, messages)
- Game board layout

This file is built incrementally during Phase 3 and Phase 5 as each UI region is migrated. Start with layout primitives and base styles only.

### 3.7 Scaffold a test page

Create `Pages/Bon/Index.cshtml` with minimal content (e.g. "BelieveOrNot — new UI") that loads htmx and the CSS file. Verify it renders at `/bon`.

**Phase 1 acceptance**: `dotnet build` succeeds, `/bon` renders the test page, old frontend at `/index.html` still works.

---

## 4) Phase 2 — BelieveOrNot Endpoints

Replace SignalR hub methods with standard HTTP POST endpoints. The game logic layer (`IGameEngine`, `IMatchManager`) is unchanged — only the communication layer changes.

### 4.1 Player action endpoints

Each endpoint receives form data (or JSON) and returns an HTML fragment (the acting player's updated UI). It also triggers SSE pushes to all other players.

| Old Hub Method | New Endpoint | Request Data | Returns |
|---|---|---|---|
| `CreateOrJoinMatch` | `POST /bon/create` | playerName, playerId, deckSize, jokerCount, jokerDisposalEnabled | Full game board HTML (redirect to game page) |
| `JoinExistingMatch` | `POST /bon/join` | matchId, playerName, playerId | Full game board HTML |
| `ReconnectToMatch` | `POST /bon/reconnect` | matchId, playerId | Full game board HTML |
| `StartRound` | `POST /bon/start-round` | matchId, playerId | HTML fragments (hand, table, players, status, actions) |
| `SubmitMove` (Play) | `POST /bon/play` | matchId, playerId, clientCmdId, cardIndices[], declaredRank | HTML fragments (hand, table, players, status, actions) |
| `SubmitMove` (Challenge) | `POST /bon/challenge` | matchId, playerId, clientCmdId, challengePickIndex | HTML fragments (hand, table, players, status, actions) |
| `EndRound` | `POST /bon/end-round` | matchId, playerId | HTML fragments |
| `EndGame` | `POST /bon/end-game` | matchId, playerId | HTML fragments + game-ended region |
| `BroadcastMessage` | `POST /bon/message` | matchId, message | Event log fragment |

### 4.2 SSE connection endpoint

`GET /bon/sse?matchId={matchId}&playerId={playerId}`

Opens SSE stream. The server pushes these event types:

| SSE Event Name | Triggers When | HTML Fragment Pushed |
|---|---|---|
| `state-update` | Any game state change | All swappable regions (personalized) |
| `game-event` | Game event (join, play, challenge, etc.) | Event log partial |
| `game-ended` | Game ends | Final results partial |

### 4.3 Match check endpoint

Keep existing `POST /game/check-match` or migrate to `POST /bon/check-match`.

### 4.4 Personalized rendering

Create a service (e.g. `BonViewRenderer`) that:
- Takes a `Match` and a `playerId`
- Renders each Razor partial to an HTML string (using `IViewRenderService` or partial view rendering)
- Returns the personalized HTML (player sees own hand, others see card counts)

This service is called by both:
- HTTP POST endpoints (for the acting player's response)
- SSE broadcaster (for all other players in the match)

### 4.5 Connection tracking

Replace `GameHub.PlayerToConnection` (ConcurrentDictionary mapping playerId → connectionId) with `SseConnectionManager` tracking playerId → SSE stream.

Handle disconnection:
- SSE stream closes → mark player as disconnected in match
- Push updated players partial to remaining players via SSE

**Phase 2 acceptance**: all BelieveOrNot endpoints respond correctly (can test with curl/Postman), SSE stream connects and receives events. No UI yet — just the plumbing.

---

## 5) Phase 3 — BelieveOrNot UI (Razor Partials)

Build the Razor page and partials. Each partial maps to one swappable DOM region. htmx swaps them via `hx-swap-oob="true"` (out-of-band swaps) so a single server response or SSE event can update multiple regions at once.

### 5.1 Swappable regions (each is one Razor partial)

| # | Partial Name | DOM id | Description | Key Model Data |
|---|---|---|---|---|
| 1 | `_ConnectionStatus.cshtml` | `connection-status` | Connection indicator | isConnected |
| 2 | `_SetupForm.cshtml` | `game-setup` | Create/join match form | (static form, no model) |
| 3 | `_GameStatus.cshtml` | `game-status` | Phase, round, current player, announced rank, pile count, match ID | GameStateDto |
| 4 | `_Players.cshtml` | `players-area` | Player list with scores, hand counts, turn indicator | GameStateDto.Players, currentPlayerIndex |
| 5 | `_Hand.cshtml` | `hand-area` | Player's own cards (selectable via checkbox pattern) | GameStateDto.YourHand |
| 6 | `_PreviousPlay.cshtml` | `previous-play` | Face-down cards from last play (clickable for challenge) | lastPlayCardCount, lastActualPlayerIndex |
| 7 | `_CardPile.cshtml` | `card-pile` | Table pile visualization | tablePileCount |
| 8 | `_Actions.cshtml` | `table-actions` | Play button, challenge confirm, rank selector | phase, isMyTurn, announcedRank, deckSize |
| 9 | `_Scores.cshtml` | `score-table` | Score table for all players | players with scores |
| 10 | `_EventLog.cshtml` | `event-log` | Last N game events | List\<GameEventDto\> |
| 11 | `_GameManagement.cshtml` | `game-management` | Start round / end round / end game / new game buttons | phase, isCreator |
| 12 | `_FinalResults.cshtml` | `final-results` | End-of-game results overlay | winners, finalScores |
| 13 | `_Help.cshtml` | `help-content` | Game rules (static) | (none) |

### 5.2 Card selection (transient UI state)

Card selection is **native HTML form behavior** with **server-driven constraints** enforced by `interaction.js`.

The server renders the hand partial with constraint attributes:
```html
<div id="hand-area"
     data-max-select="3"
     data-min-select="1"
     data-selectable-suits=""
     data-selectable-ranks="">
  <!-- Each card is a labeled checkbox -->
  <label class="card card--hearts">
    <input type="checkbox" name="cardIndices" value="0" />
    <span class="card-face">A♥</span>
  </label>
  <!-- ... more cards ... -->
  <span class="selection-counter"></span>
</div>
```

- **Visual feedback**: CSS `:checked` styles highlight/raise selected cards
- **Constraint enforcement**: `interaction.js` reads `data-max-select` and disables remaining checkboxes when limit is reached; reads `data-selectable-suits`/`data-selectable-ranks` and disables non-matching cards
- **Counter**: `interaction.js` updates `.selection-counter` text (e.g. "2 of 3 selected")
- **Submit control**: Play button is disabled until `data-min-select` is met
- **Playing cards**: htmx POSTs the form, sending checked `cardIndices[]` to `POST /bon/play`

When the server pushes a new hand partial (new round, different game rules), the `data-*` attributes change and constraints update automatically.

**Rank selector** (opening turn): radio buttons or a set of buttons. Selected rank is a form value sent with the play action.

**Challenge card selection**: radio buttons on the face-down previous-play cards. Selected index sent with `POST /bon/challenge`.

### 5.3 Full page structure

`Pages/Bon/Index.cshtml`:
```
_Layout (htmx script, CSS, SSE connection setup)
  └─ Index.cshtml
       ├─ _ConnectionStatus
       ├─ _GameManagement
       ├─ _SetupForm          (visible before joining)
       └─ _GameBoard           (visible after joining)
            ├─ _GameStatus
            ├─ _Players
            ├─ _PreviousPlay
            ├─ _CardPile
            ├─ _Actions
            ├─ _Hand
            ├─ _Scores
            └─ _EventLog
       └─ _FinalResults        (hidden, shown on game end)
```

### 5.4 htmx wiring

**Player actions** (examples):
```html
<!-- Play cards form -->
<form hx-post="/bon/play" hx-swap="none">
  <input type="hidden" name="matchId" value="..." />
  <input type="hidden" name="playerId" value="..." />
  <!-- card checkboxes rendered by _Hand partial -->
  <!-- rank radio buttons rendered by _Actions partial -->
  <button type="submit">Play</button>
</form>
```

`hx-swap="none"` because the response comes back as out-of-band swaps (`hx-swap-oob`) updating multiple regions at once.

**SSE connection** (on the game page):
```html
<div hx-ext="sse"
     sse-connect="/bon/sse?matchId=...&playerId=..."
     sse-swap="state-update">
</div>
```

When the server pushes a `state-update` event, htmx receives the HTML and swaps all `hx-swap-oob` fragments into their target `id`s.

### 5.5 Migration order within Phase 3

Build partials in this order (each step produces a testable increment):

1. `_SetupForm` — create/join match works, redirects to game board
2. `_GameStatus` + `_Players` — after joining, see match info and player list
3. `_Hand` — see your cards after round starts
4. `_Actions` — play cards button and rank selector
5. `_PreviousPlay` + `_CardPile` — see table state
6. `_Scores` + `_EventLog` — see scoring and events
7. `_GameManagement` — creator controls
8. `_FinalResults` — end-of-game overlay
9. `_ConnectionStatus` — connection indicator
10. `_Help` — rules page

Add CSS to `site.css` as each partial is built.

**Phase 3 acceptance**: full BelieveOrNot game playable at `/bon` with multiple browsers. All game actions work. SSE updates reach all players. Zero custom JavaScript.

---

## 6) Phase 4 — King Endpoints

Same pattern as Phase 2 but for the King game.

| Old Hub Method | New Endpoint | Request Data |
|---|---|---|
| `CreateOrJoinKingMatch` | `POST /king/create` | playerName, playerId, includeAvoidEverythingRound, collectingPhaseRounds |
| `JoinExistingMatch` | `POST /king/join` | matchId, playerName, playerId |
| `ReconnectToMatch` | `POST /king/reconnect` | matchId, playerId |
| `StartRound` | `POST /king/start-round` | matchId, playerId |
| `PlayCard` | `POST /king/play-card` | matchId, playerId, cardSuit, cardRank |
| `SelectTrump` | `POST /king/select-trump` | matchId, playerId, trumpSuit |
| `EndRound` | `POST /king/end-round` | matchId, playerId |

SSE endpoint: `GET /king/sse?matchId={matchId}&playerId={playerId}`

SSE events: `state-update`, `game-event`

**Phase 4 acceptance**: all King endpoints respond, SSE works. Test with curl.

---

## 7) Phase 5 — King UI (Razor Partials)

### 7.1 Swappable regions

| # | Partial Name | DOM id | Description |
|---|---|---|---|
| 1 | `_KingSetupForm.cshtml` | `king-setup` | Create/join form (4 players required) |
| 2 | `_KingGameStatus.cshtml` | `king-status` | Phase, round number, total rounds, round type, trump, current player |
| 3 | `_KingPlayers.cshtml` | `king-players` | 4-position circular layout with stats |
| 4 | `_KingTrick.cshtml` | `king-trick` | Center table with 4 card slots |
| 5 | `_KingHand.cshtml` | `king-hand` | Player's cards (single-select for King) |
| 6 | `_KingActions.cshtml` | `king-actions` | Play card button, turn messages |
| 7 | `_KingTrumpSelect.cshtml` | `king-trump-select` | Trump suit selection (4 suit buttons) |
| 8 | `_KingRoundInfo.cshtml` | `king-round-info` | Round name, description, rules |
| 9 | `_KingScores.cshtml` | `king-scores` | Score table |
| 10 | `_KingEventLog.cshtml` | `king-event-log` | Event history |
| 11 | `_KingManagement.cshtml` | `king-management` | Start/end round buttons |
| 12 | `_KingTrumpDisplay.cshtml` | `king-trump-display` | Trump card indicator (corner) |

### 7.2 Card selection (King-specific)

King allows playing exactly **one card** per turn. The server renders the hand with single-select constraint and legal-move filtering:

```html
<div id="king-hand"
     data-select-mode="single"
     data-selectable-suits="spades"
     data-selectable-ranks="">
  <label class="card card--spades">
    <input type="radio" name="cardIndex" value="0" />
    <span class="card-face">K♠</span>
  </label>
  <label class="card card--hearts">
    <input type="radio" name="cardIndex" value="1" disabled />
    <span class="card-face">Q♥</span>
  </label>
</div>
```

The server determines legal moves (must follow suit, etc.) and expresses them via `data-selectable-suits`/`data-selectable-ranks`. `interaction.js` disables non-matching cards. The server also renders `disabled` directly on illegal cards as a fallback.

### 7.3 Trump selection

Four suit buttons, each an htmx POST:
```html
<button hx-post="/king/select-trump"
        hx-vals='{"trumpSuit": "Hearts", "matchId": "...", "playerId": "..."}'
        hx-swap="none">
  ♥ Hearts
</button>
```

**Phase 5 acceptance**: full King game playable at `/king` with 4 browsers. All actions work. SSE updates reach all players. Zero custom JavaScript.

---

## 8) Phase 6 — Switchover & Cleanup

### 8.1 Remap root URL

Update `Program.cs`:
- Root `/` redirects to `/bon`
- Or configure Razor Pages to serve `Pages/Bon/Index.cshtml` at `/`
- Remove `UseDefaultFiles()` for old static HTML

### 8.2 Delete old frontend files

Remove:
- `Server/wwwroot/js/` — all 73 BelieveOrNot JS files
- `Server/wwwroot/king/js/` — all 37 King JS files
- `Server/wwwroot/styles/` — all 29 BelieveOrNot CSS files
- `Server/wwwroot/king/styles/` — all 5 King CSS files
- `Server/wwwroot/index.html`
- `Server/wwwroot/setup-form.html`
- `Server/wwwroot/game-board.html`
- `Server/wwwroot/help.html`
- `Server/wwwroot/other-games.html`
- `Server/wwwroot/king/*.html`

Keep:
- `Server/wwwroot/css/site.css` (new)
- `Server/wwwroot/lib/htmx/` (if vendored)
- Any static assets (images, favicons) if they exist

### 8.3 Remove SignalR

- Delete `Server/BelieveOrNot/GameHub.cs` and all `GameHub_*.cs` partials
- Delete `Server/King/KingHub.cs` and all `KingHub_*.cs` partials
- Delete `Server/King/KingEventBroadcaster.cs`
- Remove `builder.Services.AddSignalR()` from `Program.cs`
- Remove `app.MapHub<GameHub>()` and `app.MapHub<KingHub>()` from `Program.cs`
- Remove `Microsoft.AspNetCore.SignalR.Common` NuGet package
- Remove SignalR from global usings

### 8.4 Clean up models

- `GameStateDto` / `KingGameStateDto` may still be useful as view models for Razor partials, or they may be replaced by simpler per-partial models. Evaluate during Phase 3/5.
- `GameEventDto` / `GameEventFactory` — keep if the event system is still useful for the event log partial.

**Phase 6 acceptance**: app builds with no SignalR dependency, no JS files, no old HTML. Full functionality at `/bon` and `/king`. Single CSS file.

---

## 9) Files created / modified summary

### New files
```
Server/
  Pages/
    _ViewImports.cshtml
    _ViewStart.cshtml
    Bon/
      Index.cshtml
      Index.cshtml.cs
      _Layout.cshtml
      Partials/
        _ConnectionStatus.cshtml
        _SetupForm.cshtml
        _GameStatus.cshtml
        _Players.cshtml
        _Hand.cshtml
        _PreviousPlay.cshtml
        _CardPile.cshtml
        _Actions.cshtml
        _Scores.cshtml
        _EventLog.cshtml
        _GameManagement.cshtml
        _FinalResults.cshtml
        _Help.cshtml
    King/
      Index.cshtml
      Index.cshtml.cs
      Partials/
        _KingSetupForm.cshtml
        _KingGameStatus.cshtml
        _KingPlayers.cshtml
        _KingTrick.cshtml
        _KingHand.cshtml
        _KingActions.cshtml
        _KingTrumpSelect.cshtml
        _KingRoundInfo.cshtml
        _KingScores.cshtml
        _KingEventLog.cshtml
        _KingManagement.cshtml
        _KingTrumpDisplay.cshtml
  Sse/
    SseConnectionManager.cs
    SseBroadcaster.cs
  Endpoints/
    BonEndpoints.cs          ← all BelieveOrNot HTTP POST endpoints
    KingEndpoints.cs         ← all King HTTP POST endpoints
    BonSseEndpoint.cs        ← SSE connection for BelieveOrNot
    KingSseEndpoint.cs       ← SSE connection for King
  Services/
    BonViewRenderer.cs       ← renders personalized Razor partials to HTML strings
    KingViewRenderer.cs
  wwwroot/
    css/
      site.css               ← single CSS file
    js/
      interaction.js         ← single permitted JS file (server-driven constraint enforcement)
    lib/
      htmx/                  ← htmx + SSE extension (if vendored)
```

### Modified files
```
Server/Program.cs            ← add Razor Pages, SSE, new endpoints; later remove SignalR
Server/BelieveOrNot.Server.csproj  ← remove SignalR package (Phase 6)
```

### Deleted files (Phase 6)
```
Server/wwwroot/js/**              ← all 73 JS files
Server/wwwroot/king/js/**         ← all 37 JS files
Server/wwwroot/styles/**          ← all 29 CSS files
Server/wwwroot/king/styles/**     ← all 5 CSS files
Server/wwwroot/*.html             ← all static HTML files
Server/wwwroot/king/*.html        ← all King HTML files
Server/BelieveOrNot/GameHub*.cs   ← all hub files
Server/King/KingHub*.cs           ← all King hub files
Server/King/KingEventBroadcaster.cs
```

---

## 10) Progress tracking

Migration progress is tracked in `specs/bon-v001-03-migration-progress.md`. That file is updated after each completed step. `CLAUDE.md` references it so any future LLM session reads it first.

---
**End of migration specification.**
