# Phase 6 — Switchover & Cleanup

## Context

Phases 1-5 are complete: both BelieveOrNot (`/bon`) and King (`/king`) are fully playable via htmx+SSE with server-side Razor rendering. The old SignalR+vanilla JS frontend is no longer needed. Phase 6 removes all legacy code, removes the SignalR dependency, and makes the htmx UI the only frontend.

## Approach

Work in 4 steps: (1) delete old frontend files, (2) delete SignalR hub files, (3) remove SignalR dependencies from remaining code, (4) remap root URL. Build after each step to catch errors incrementally.

---

## Step 1 — Delete Old Frontend Files (~152 files)

Delete entire directories (bash `rm -rf`):
- `Server/wwwroot/js/` — 71 old BelieveOrNot JS modules
- `Server/wwwroot/styles/` — 29 old BelieveOrNot CSS files
- `Server/wwwroot/king/js/` — 37 old King JS modules
- `Server/wwwroot/king/styles/` — 5 old King CSS files

Delete old HTML files:
- `Server/wwwroot/index.html`
- `Server/wwwroot/game-board.html`
- `Server/wwwroot/help.html`
- `Server/wwwroot/setup-form.html`
- `Server/wwwroot/other-games.html`
- `Server/wwwroot/king/king.html`
- `Server/wwwroot/king/game-board.html`
- `Server/wwwroot/king/help.html`
- `Server/wwwroot/king/setup-form.html`

**Preserve:**
- `Server/wwwroot/lib/htmx/` (htmx 2.0.8 + SSE ext)
- `Server/wwwroot/css/site.css` (new htmx styles)
- `Server/wwwroot/js/interaction.js` (new htmx JS)

**Build check** after this step.

## Step 2 — Delete SignalR Hub Files (21 files)

BelieveOrNot hubs (10 files) — `Server/BelieveOrNot/GameHub*.cs`:
- `GameHub.cs`, `GameHub_BroadcastMessage.cs`, `GameHub_BroadcastPersonalizedStates.cs`
- `GameHub_CreateOrJoinMatch.cs`, `GameHub_EndGame.cs`, `GameHub_EndRound.cs`
- `GameHub_JoinExistingMatch.cs`, `GameHub_ReconnectToMatch.cs`
- `GameHub_StartRound.cs`, `GameHub_SubmitMove.cs`

King hubs (11 files) — `Server/King/KingHub*.cs`:
- `KingHub.cs`, `KingHub_BroadcastPersonalizedStates.cs`, `KingHub_CreateOrJoinMatch.cs`
- `KingHub_EndRound.cs`, `KingHub_JoinExistingMatch.cs`, `KingHub_OnConnectedAsync.cs`
- `KingHub_OnDisconnectedAsync.cs`, `KingHub_PlayCard.cs`, `KingHub_ReconnectToMatch.cs`
- `KingHub_SelectTrump.cs`, `KingHub_StartRound.cs`

## Step 3 — Remove SignalR Dependencies

### `Server/BelieveOrNot.Server.csproj`
- Remove: `<PackageReference Include="Microsoft.AspNetCore.SignalR.Common" Version="9.0.9" />`

### `Server/!_GlobalUsings.cs`
- Remove: `global using Microsoft.AspNetCore.SignalR;`

### `Server/King/KingEventBroadcaster.cs`
- Remove `IHubContext<KingHub>` constructor parameter + field
- Remove SignalR line: `await _hubContext.Clients.Group(...).SendAsync(...);`
- Keep all SSE broadcast logic intact

### `Server/Program.cs`
- Remove: `builder.Services.AddSignalR();`
- Remove: `var hubPath = ...` + `app.MapHub<GameHub>(hubPath);` + `app.MapHub<KingHub>("/kingHub");`
- Remove: `app.UseDefaultFiles();` (no static HTML entry points)
- Remove: King static file serving block (custom `UseStaticFiles` for `/king` subfolder)
- Remove: `/game/check-match` endpoint (was for old SignalR frontend)
- Keep: `app.UseStaticFiles();`, `app.MapRazorPages();`, SSE endpoints, all game endpoints

**Build check** after this step — should be 0 errors, 0 warnings.

## Step 4 — Remap Root URL

Create `Server/Pages/Index.cshtml` — game selector landing page at `/`:
- Simple Razor page with `@page "/"`, links to `/bon` and `/king`
- Styled consistently (reuses site.css classes)

Update "OTHER GAMES" links:
- `Server/Pages/Bon/Index.cshtml`: link stays as `href="/"`
- `Server/Pages/King/Index.cshtml`: link stays as `href="/"`

Update progress tracker: `specs/bon-v001-03-migration-progress.md` — mark Phase 6 items complete.

---

## Files Modified
| File | Change |
|---|---|
| `Server/BelieveOrNot.Server.csproj` | Remove SignalR package ref |
| `Server/!_GlobalUsings.cs` | Remove SignalR using |
| `Server/Program.cs` | Remove SignalR, old static serving, old check-match |
| `Server/King/KingEventBroadcaster.cs` | Remove IHubContext, keep SSE only |
| `specs/bon-v001-03-migration-progress.md` | Mark Phase 6 complete |

## Files Created
| File | Purpose |
|---|---|
| `Server/Pages/Index.cshtml` | Game selector landing page at `/` |

## Files Deleted
~173 files total (152 old frontend + 21 hub files)

---

## Verification

1. `dotnet build -c Release` — 0 errors, 0 warnings
2. `http://127.0.0.1:44999/` — game selector page with links to both games
3. `/bon` — BelieveOrNot fully works (create, join, play, SSE)
4. `/king` — King fully works (create, join, play, SSE)
5. Old URLs return 404: `/game`, `/kingHub`, `/index.html`, `/king/king.html`
6. "OTHER GAMES" links navigate to `/`
