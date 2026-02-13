# Migration Summary: SignalR + Vanilla JS → htmx + SSE + Razor

**Branch**: `ai-htmx` (based off `main`)
**Duration**: 2026-02-10 to 2026-02-12 (3 days)
**Commits**: 32
**Phases**: 6

---

## Overall Diff (main → ai-htmx)

| Metric | Count |
|---|---|
| **Files changed** | 259 |
| **Files added** | 74 |
| **Files deleted** | 174 |
| **Files modified** | 11 |
| **Lines inserted** | +7,637 |
| **Lines deleted** | -11,389 |
| **Net change** | -3,752 lines |

The codebase shrank by ~3,750 lines despite adding two complete server-rendered UIs.

---

## Breakdown by File Type

| Type | Files Changed | Insertions | Deletions |
|---|---|---|---|
| C# (`.cs`) | 40 | +1,848 | -1,002 |
| Razor (`.cshtml`) | 37 | +1,371 | — |
| JavaScript (`.js`) | 113 | +685 | -6,506 |
| CSS (`.css`) | 35 | +1,706 | -2,981 |
| HTML (`.html`) | 9 | — | -899 |
| Markdown (`.md`) | 11 | +2,003 | — |
| Other (png, json, etc.) | 4 | +24 | -1 |

---

## What Was Deleted (174 files, ~11,350 lines)

### Old Frontend — BelieveOrNot (105 files)
- 71 JavaScript modules (`wwwroot/js/`) — SignalR client, game logic, display rendering, UI utilities
- 29 CSS files (`wwwroot/styles/`) — card styles, game board, components, responsive
- 5 HTML files (`index.html`, `game-board.html`, `help.html`, `setup-form.html`, `other-games.html`)

### Old Frontend — King (46 files)
- 37 JavaScript modules (`wwwroot/king/js/`) — SignalR client, game logic, display rendering
- 5 CSS files (`wwwroot/king/styles/`) — King game board, trump modal, responsive
- 4 HTML files (`king.html`, `game-board.html`, `help.html`, `setup-form.html`)

### SignalR Hubs (21 files, ~964 lines)
- 10 `GameHub*.cs` files (BelieveOrNot hub + partial classes)
- 11 `KingHub*.cs` files (King hub + partial classes)

### Dependencies Removed
- `Microsoft.AspNetCore.SignalR.Common` NuGet package
- `global using Microsoft.AspNetCore.SignalR;`
- `IHubContext<KingHub>` from `KingEventBroadcaster`
- `AddSignalR()`, `MapHub<>()`, `UseDefaultFiles()` from `Program.cs`

---

## What Was Added (74 files, ~5,374 source lines)

### Server-Side Rendering (37 Razor partials)
- **BelieveOrNot** (16 partials): `_Actions`, `_CardPile`, `_ConnectionStatus`, `_EventLog`, `_FinalResults`, `_GameManagement`, `_GameStatus`, `_Hand`, `_Help`, `_ManagementControls`, `_Players`, `_PreviousPlay`, `_Scores`, `_SetupForm`, `_SseContainer` + `Index.cshtml`
- **King** (16 partials): `_Actions`, `_ConnectionStatus`, `_EventLog`, `_FinalResults`, `_GameStatus`, `_Hand`, `_Management`, `_ManagementControls`, `_Players`, `_RoundInfo`, `_Scores`, `_SetupForm`, `_SseContainer`, `_Trick`, `_TrumpDisplay`, `_TrumpSelect` + `Index.cshtml`
- **Shared**: `_Layout.cshtml`, `_ViewImports.cshtml`, `_ViewStart.cshtml`, root `Index.cshtml` (game selector)
- **Layout**: Single shared layout with htmx 2.0.8 + SSE extension

### HTTP Endpoints (2 files)
- `BonEndpoints.cs` — POST endpoints for create, join, reconnect, play, challenge, start/end round/game, message, check-match
- `KingEndpoints.cs` — POST endpoints for create, join, reconnect, play-card, select-trump, start/end round

### Services (5 files)
- `BonViewModel.cs` / `KingViewModel.cs` — view model wrappers with computed properties
- `BonViewRenderer.cs` / `KingViewRenderer.cs` — render Razor partials to HTML strings for SSE
- `RazorPartialRenderer.cs` — generic partial-to-string renderer

### SSE Infrastructure (2 files)
- `SseConnectionManager.cs` — tracks active SSE connections per player/match
- `SseBroadcaster.cs` — sends personalized SSE events to match participants

### Frontend (3 files)
- `site.css` — single CSS file (1,300+ lines) replacing 34 old CSS files
- `interaction.js` — constraint enforcement, card order tracking (~200 lines, the only JS)
- htmx 2.0.8 + SSE extension 2.2.4 (vendored in `lib/htmx/`)

### Specs & Documentation (11 files)
- Migration spec, progress tracker, test plans, error screenshots

---

## What Was Modified (11 files)

| File | Change |
|---|---|
| `!_GlobalUsings.cs` | Removed SignalR using |
| `BelieveOrNot.Server.csproj` | Removed SignalR package, added Razor Pages content items |
| `Program.cs` | Added Razor Pages, SSE endpoints, cookie middleware; removed SignalR |
| `GameEngine_CreateGameStateDto.cs` | Added fields for htmx rendering (personalized last play, challenge result) |
| `GameEngine_EndRound.cs` | Score tracking adjustments |
| `GameEngine_HandleChallengeAction.cs` | Challenge result storage on Match |
| `GameEngine_HandlePlayAction.cs` | Clear challenge result on new play |
| `GameStateDto.cs` | Added `LastPlayedCards`, `ChallengeResult` fields |
| `Match.cs` | Added `LastChallengeResult` property |
| `KingEventBroadcaster.cs` | Removed SignalR broadcast, SSE-only |
| `KingGameEngine_CreateGameStateDtoForPlayer.cs` | Minor DTO adjustments |

---

## Architecture Before vs After

| Aspect | Before (SignalR) | After (htmx + SSE) |
|---|---|---|
| **Real-time transport** | WebSocket (SignalR) | Server-Sent Events |
| **UI rendering** | Client-side JS (108 modules) | Server-side Razor (37 partials) |
| **Custom JavaScript** | ~6,500 lines across 108 files | ~200 lines in 1 file |
| **CSS files** | 34 files across 2 directories | 1 file (`site.css`) |
| **HTML files** | 9 static HTML files | 0 (Razor pages) |
| **Hub/endpoint files** | 21 SignalR hub files | 2 endpoint files |
| **Dependencies** | SignalR NuGet package | None (htmx vendored, ASP.NET built-in) |
| **State updates** | Client parses JSON, rebuilds DOM | Server renders HTML, htmx swaps OOB |

---

## Key Metrics

- **JavaScript reduction**: 6,506 → 685 lines (**-89%**)
- **CSS consolidation**: 34 files → 1 file
- **Total frontend files**: 152 → 3 (**-98%**)
- **Server hub files**: 21 → 2 endpoint files
- **Net codebase reduction**: 3,752 lines smaller

---

*Data sourced from `git diff --stat main..ai-htmx` on the `ai-htmx` branch, 2026-02-12.*
