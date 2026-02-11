# Authoritative UI Tech Stack Specification — BelieveOrNot

## Purpose & Scope

This document defines the **only approved web UI tech stack** for the BelieveOrNot multiplayer card game platform where:
- UI is specified by humans,
- implemented and maintained by LLMs,
- without SPA frameworks,
- without Node.js dependency trees,
- with long-term maintainability and spec-based evolution.

This application is **multiplayer and real-time**: when any player acts, all players in the match must see updated UI. The tech stack is chosen specifically to support server-initiated updates to multiple clients while remaining fully LLM-maintainable.

This document is **authoritative**.
CC must **not** ask clarification questions or introduce alternatives.

---

## Authoritative Tech Stack

### UI Paradigm
**HTML-over-the-wire**

- Server renders HTML
- Browser receives HTML (full page or fragments)
- No JSON-to-UI rendering
- No client-side application model

**Rationale:** The current codebase uses 110 JS files (~6,500 lines) to convert JSON from SignalR into DOM updates. This imperative, stateful JS is the primary reason LLMs cannot reliably modify the UI. HTML-over-the-wire eliminates the entire client-side rendering layer.

---

### Interactivity Layer
**htmx + server-driven interaction script**

- htmx is the **primary JavaScript library**
- Player actions are defined declaratively via `hx-post` / `hx-get` attributes
- Server-initiated updates are received via htmx SSE extension (`hx-ext="sse"`)
- A single **`interaction.js`** file is permitted for transient UI constraints (see section below)
- No other custom JS files

**Rationale:** htmx provides both the request/response cycle (player actions) and server-push reception (SSE) in a single declarative library. A minimal interaction script handles pre-submission UX constraints that pure CSS cannot express.

---

### Server-Push Mechanism
**Server-Sent Events (SSE)**

SSE replaces SignalR for server-initiated updates to all players:
- Each player opens one SSE connection when joining a match
- Server pushes personalized HTML fragments to each player's SSE stream
- htmx SSE extension receives fragments and swaps them into the DOM
- SSE connections auto-reconnect natively (built into the browser)

**Why SSE, not SignalR:**

| Concern | SignalR | SSE |
|---|---|---|
| Server → client push | Yes | Yes |
| Client → server | Hub method calls | Standard HTTP POST (htmx handles this) |
| Personalized per player | Different DTO per connection | Different HTML per connection |
| Reconnection | Built-in | Built into browser SSE spec |
| Complexity | Full-duplex WebSocket abstraction, custom protocol, NuGet dependency | Native browser API, no client library, minimal server code |
| LLM maintainability | Requires understanding hub methods, DTOs, JS callbacks | Standard HTTP endpoints + HTML templates |

Full-duplex (SignalR/WebSocket) is unnecessary because player actions are discrete HTTP requests, not a continuous stream. The only continuous channel needed is server → client, which is exactly what SSE provides.

**Connection limit note:** HTTP/1.1 limits ~6 SSE connections per domain per browser. The server must use HTTP/2 (Kestrel supports this by default) to avoid this limit.

---

### Backend Rendering
**Razor Pages / Razor Partials**

- C# Razor templates are the **only UI components**
- Full pages for initial load
- Partial views (fragments) for htmx swaps and SSE pushes
- Each swappable UI region is one Razor partial

**Rationale:** Razor is the native ASP.NET Core templating engine. No additional dependencies. The server already computes personalized game state per player — it now renders that state directly to HTML instead of serializing it as JSON.

---

### Application Type
**NOT an SPA**

Explicit exclusions:
- No React / Vue / Angular
- No client-side routing
- No hydration
- No client state management
- No JSON APIs for UI rendering
- No SignalR

---

## Communication Model

### Player Action Flow (request/response)
```
Player clicks "Play Cards"
  → htmx sends HTTP POST to /game/play-cards
  → Server processes move via GameEngine
  → Server returns HTML fragment (updated UI for acting player)
  → htmx swaps fragment into DOM
  → Server simultaneously pushes HTML fragments via SSE to all other players
```

### Server-Initiated Update Flow (SSE push)
```
Server game state changes (any cause)
  → Server renders personalized Razor partial per player
  → Server pushes HTML fragment to each player's SSE stream
  → htmx SSE extension swaps fragment into DOM
```

Both flows result in the same outcome: Razor partials rendered server-side, swapped into the DOM by htmx. The only difference is the transport (HTTP response vs. SSE event).

---

## State Ownership Rules
- **Server is the sole owner of all game state**
- Client holds no authoritative data
- UI is a pure projection of server-side game state
- All player **submissions** must round-trip to the server
- The browser stores no game state — not in JS variables, not in `window.*`, not in `data-*` attributes used for logic

### Transient UI state vs. game state
**Native HTML control state** (form inputs, checkboxes, toggle classes) is allowed in the browser. This is not "client state" — it is standard browser form behavior.

Example — playing cards:
1. Player clicks cards to select/deselect them → **local only** (checkbox toggles, CSS class changes)
2. Player clicks "Play" → **round-trip** (htmx POSTs selected card IDs to server)

Only step 2 is a game action. Step 1 is equivalent to a user filling out a form before clicking Submit. No custom JavaScript is needed — HTML controls and CSS handle selection natively.

**Rule of thumb:** if the interaction can be expressed as native HTML form/control behavior (checkboxes, radio buttons, toggle classes via `<label>`/`<input>` patterns), it stays in the browser. If it changes game state, it goes to the server.

---

## Interaction Script Rules (`interaction.js`)

### Why it exists
CSS `:checked` and `:has()` handle most selection visuals (highlighting, showing/hiding buttons). However, some pre-submission constraints cannot be expressed in CSS alone:
- Enforce maximum card selection (e.g. "select up to 3 cards")
- Enforce card filtering (e.g. "only spades are selectable")
- Display selection counters (e.g. "2 of 3 cards selected")

These constraints are **game rules** and must not be hardcoded in the client. The server defines them.

### Server-driven constraints via `data-*` attributes

The server renders constraint rules as `data-*` attributes on the container element. `interaction.js` reads these attributes and enforces them. When the server pushes new HTML (via SSE or HTTP response), the constraints update automatically because new `data-*` values arrive with the new HTML.

Example — server renders the hand partial:
```html
<div id="hand-area"
     data-max-select="3"
     data-min-select="1"
     data-selectable-suits="spades,hearts,diamonds,clubs"
     data-selectable-ranks="7,8,9,10,J,Q,K,A">
  <!-- card checkboxes here -->
</div>
```

`interaction.js` reads these attributes and:
- Disables further checkboxes when `data-max-select` is reached
- Restricts selection to cards matching `data-selectable-suits` / `data-selectable-ranks`
- Updates a counter display if present

When the server sends a new `_Hand.cshtml` partial (e.g. after a round change with different rules), the `data-*` attributes change and the constraints change with them. No client logic needs updating.

### Strict boundaries

`interaction.js` **may**:
- Read `data-*` attributes from server-rendered HTML
- Enable/disable form controls (checkboxes, radio buttons, buttons)
- Update text content of counter elements
- Add/remove CSS modifier classes for visual feedback
- Listen to `htmx:afterSwap` to re-apply constraints after SSE updates

`interaction.js` **must NOT**:
- Hold game state (match ID, player ID, game phase, scores, etc.)
- Render HTML or construct DOM elements
- Communicate with the server (htmx does all HTTP and SSE)
- Contain game-rule logic — all rules come from server-rendered `data-*` attributes
- Grow beyond a single file

### Constraint vocabulary

The following `data-*` attributes are the defined constraint vocabulary. `interaction.js` supports only these. New constraints require updating both the spec and the script.

| Attribute | Type | Meaning |
|---|---|---|
| `data-max-select` | integer | Maximum selectable items |
| `data-min-select` | integer | Minimum items required to enable submit |
| `data-selectable-suits` | comma-separated | Which suits can be selected (empty = all) |
| `data-selectable-ranks` | comma-separated | Which ranks can be selected (empty = all) |
| `data-select-mode` | `"multi"` or `"single"` | Checkbox (multi) vs. radio (single) behavior |

---

## UI Rendering Model
- Initial page load returns full HTML (Razor page)
- Player actions trigger HTTP POST via htmx → server returns HTML fragment → htmx swaps it
- Other players receive SSE-pushed HTML fragments → htmx swaps them
- The browser never constructs or modifies DOM from data — it only receives and displays server-rendered HTML

---

## Template Structure Rules
- Templates are decomposed into:
  - **Pages** — full HTML documents (initial load, navigation)
  - **Partials (fragments)** — replaceable UI regions
- Each fragment maps to one swappable DOM region, identified by a stable `id`
- The same partial serves both HTTP responses and SSE pushes
- No dynamic DOM construction in JavaScript

### Expected UI Regions (as partials)
Each of these is a single Razor partial, independently updatable:
- Player's hand
- Table pile
- Action buttons (play / challenge)
- Rank selector
- Player list with scores and connection status
- Game event log
- Game setup form
- Match info / status

---

## CSS Rules & Layout Primitives

### CSS Policy
- Single, custom CSS file
- No CSS frameworks
- No CSS-in-JS
- No inline styles (except rare, documented cases)
- `!important` is **globally forbidden**

### Layout Primitives (Mandatory)
All layout must be expressed using only these primitives:
- `row` — horizontal alignment
- `stack` — vertical alignment
- `grid` — structured layouts

No ad-hoc layout logic outside these primitives.

---

## Control Styling & Overrides

### Base Rule
Every UI control has:
- exactly **one base class**
- zero or more **modifier classes**

### Overrides
- Overrides are done **only** via modifier classes
- Modifier styles must:
  - be more specific than base styles, and
  - appear later in the CSS file
- `!important` is **not allowed** at control level

---

## LLM Interaction Contract
- LLMs implement UI **only from approved specs**
- Specs map directly to:
  - Razor partials (with `data-*` constraint attributes where needed)
  - CSS modifier classes
  - HTTP endpoints (for player actions)
  - SSE event names (for server pushes)
- LLMs must not invent:
  - client state
  - additional JS files (only `interaction.js` exists, and only for constraint enforcement)
  - additional frameworks or libraries
  - alternative communication mechanisms
- When adding new interaction constraints:
  - Define the `data-*` attribute in the spec first
  - Add server-side rendering of the attribute in the Razor partial
  - Add handling in `interaction.js`

---

## Hard DOs
- Use HTML-over-the-wire exclusively
- Use htmx for player actions (HTTP POST) and receiving server pushes (SSE)
- Use SSE for all server-initiated updates to players
- Render all UI on the server using Razor
- Push personalized HTML to each player (do not expose other players' hands)
- Encode all interaction constraints as `data-*` attributes in server-rendered HTML
- Keep CSS minimal and owned in a single file
- Follow layout primitives strictly
- Implement overrides via modifier classes only

---

## Hard DO NOTs
- Do NOT introduce SPA frameworks
- Do NOT add Node.js tooling
- Do NOT add UI component libraries
- Do NOT use `!important`
- Do NOT implement client-side game state
- Do NOT return JSON for UI rendering
- Do NOT use SignalR
- Do NOT hardcode game rules in `interaction.js` — all rules come from server-rendered `data-*` attributes
- Do NOT create additional JS files beyond `interaction.js`

---

## Maintenance & Evolution Rules
- All UI changes must be driven by updated specs
- LLMs update Razor templates and CSS accordingly
- No speculative refactors
- No architectural drift
- Stability is preferred over novelty

---
**End of authoritative specification.**
