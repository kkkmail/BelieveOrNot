# Phase 4 — King Endpoints Implementation Plan

## Context

This is Phase 4 of the SignalR → htmx+SSE migration. Phases 1-3 (Foundation, BelieveOrNot Endpoints, BelieveOrNot UI) are complete. Phase 4 converts the King game's SignalR hub methods to HTTP POST endpoints + SSE, following the exact same pattern established by BonEndpoints in Phase 2.

The King game UI (Phase 5) does not exist yet. Phase 4 delivers the **plumbing** — endpoints that respond correctly (testable with curl), SSE that pushes events, and a placeholder view renderer.

---

## Files to Create

### 1. `Server/Endpoints/KingEndpoints.cs`
Static class mirroring `BonEndpoints.cs` (587 lines). Extension method `MapKingEndpoints()`.

**7 POST endpoints**, each following the same flow: validate → call engine/manager → broadcast events via SSE → broadcast state via SSE → return HTML:

| Endpoint | Hub Source | Key Logic |
|---|---|---|
| `POST /king/create` | `KingHub_CreateOrJoinMatch.cs` | `matchManager.CreateMatch(name, id, settings)`, broadcast join event + state, return `RenderAllRegionsAsync` |
| `POST /king/join` | `KingHub_JoinExistingMatch.cs` | Validate match exists, not started, not full (4 max), duplicate name handling via `matchManager.JoinMatch`, broadcast join event + state, return `RenderAllRegionsAsync` |
| `POST /king/reconnect` | `KingHub_ReconnectToMatch.cs` | Find player in match, set `IsConnected=true`, broadcast reconnect event + state, return `RenderAllRegionsAsync` |
| `POST /king/start-round` | `KingHub_StartRound.cs` | Creator-only, require 4 players, `gameEngine.StartNewRound(match)`, broadcast state, return `RenderStateUpdateAsync` |
| `POST /king/play-card` | `KingHub_PlayCard.cs` | Parse card (rank+suit), `gameEngine.PlayCard(match, playerId, card)`, broadcast card-played event + state. If trick complete (4 cards): immediately call `CompleteTrickAndContinue`, broadcast state again. Return `RenderStateUpdateAsync` |
| `POST /king/select-trump` | `KingHub_SelectTrump.cs` | Parse suit enum, `gameEngine.SelectTrump(match, playerId, suit)`, broadcast trump-selected event + state, return `RenderStateUpdateAsync` |
| `POST /king/end-round` | `KingHub_EndRound.cs` | Creator-only, must be InProgress. Reset match state manually (clear trick/hands/trump, advance round index), broadcast end event + state, return `RenderStateUpdateAsync` |

**Helper methods** (same pattern as BonEndpoints):
- `GetPlayerId(HttpContext)` — read PlayerId cookie
- `BroadcastStatesAsync(match, viewRenderer, broadcaster, sseManager)` — render personalized state for each SSE connection, send via `state-update` event
- `BroadcastEventAsync(match, gameEvent, viewRenderer, broadcaster)` — render event log entry HTML, send via `game-event` event

**Trick completion**: Unlike the hub's 2-second delay, the endpoint will complete tricks immediately (no `Task.Delay`). The delay is a UI concern that Phase 5 can address via SSE timing.

### 2. `Server/Services/KingViewRenderer.cs`
Scoped service mirroring `BonViewRenderer.cs`. Interface `IKingViewRenderer`.

**Phase 4 returns placeholder HTML** (real Razor partials come in Phase 5):

```csharp
public interface IKingViewRenderer
{
    Task<string> RenderAllRegionsAsync(KingMatch match, Guid playerId);
    Task<string> RenderStateUpdateAsync(KingMatch match, Guid playerId);
    Task<string> RenderEventLogEntryAsync(GameEventDto gameEvent);
    Task<string> RenderFinalResultsAsync(List<string> winners, List<string> finalScores, string winnerText);
}
```

- `RenderAllRegionsAsync`: Returns placeholder `<div id="king-..." hx-swap-oob="true">` elements for all King regions (setup, status, players, trick, hand, actions, trump-select, round-info, scores, event-log, management, trump-display) + SSE container
- `RenderStateUpdateAsync`: Same but excludes SSE container and event log (same pattern as BonViewRenderer)
- `RenderEventLogEntryAsync`: Inline HTML (no Razor), `<div hx-swap-oob="afterbegin:#king-event-log">` — same pattern as BonViewRenderer
- `RenderFinalResultsAsync`: Inline HTML for game-over overlay

### 3. Modify `Server/King/KingEventBroadcaster.cs`
Add `ISseBroadcaster` injection alongside existing `IHubContext<KingHub>`. Each broadcast method now sends to **both** SignalR (old UI) and SSE (new UI):

```csharp
public KingEventBroadcaster(IHubContext<KingHub> hubContext, ISseBroadcaster sseBroadcaster)
```

Each method (BroadcastCardPlayed, BroadcastTrumpSelected, BroadcastTrickWon, BroadcastRoundEnded):
1. Creates GameEventDto (existing code, unchanged)
2. Sends via SignalR to `kingmatch:{matchId}` group (existing code, unchanged)
3. **NEW**: Renders event log entry HTML inline (same format as KingViewRenderer.RenderEventLogEntryAsync), sends via SSE `game-event` event

This ensures events from `KingGameEngine.CompleteTrickAndContinue` (which calls the broadcaster internally) reach SSE clients.

### 4. Modify `Server/Program.cs`
Add to service registration:
```csharp
builder.Services.AddScoped<IKingViewRenderer, KingViewRenderer>();
```

Add endpoint mapping:
```csharp
app.MapKingEndpoints();
```

Add SSE endpoint for King (`GET /king/sse`) — exact same pattern as `/bon/sse` but uses `IKingMatchManager`:
- Parse matchId/playerId from query params
- Set SSE headers
- Register connection in `SseConnectionManager`
- Send initial `connected` event
- Hold connection open
- On disconnect: mark player `IsConnected=false`, broadcast disconnect event + state to remaining players

---

## Files to Modify

| File | Change |
|---|---|
| `Server/Program.cs` | Add `IKingViewRenderer` registration, `MapKingEndpoints()`, `/king/sse` endpoint |
| `Server/King/KingEventBroadcaster.cs` | Add `ISseBroadcaster` injection, dual-broadcast (SignalR + SSE) |

## Existing Code to Reuse

| What | Where |
|---|---|
| `IKingMatchManager` (CreateMatch, JoinMatch, GetMatch) | `Server/King/IKingMatchManager.cs` |
| `IKingGameEngine` (StartNewRound, PlayCard, SelectTrump, CompleteTrickAndContinue) | `Server/King/IKingGameEngine.cs` |
| `GameEventFactory` (CreateJoinEvent, CreateConnectionEvent) | `Server/BelieveOrNot/GameEventFactory*.cs` |
| `GameEventDto` | `Server/BelieveOrNot/GameEventDto.cs` |
| `MessageFormatter` | `Server/BelieveOrNot/MessageFormatter.cs` |
| `ISseBroadcaster`, `ISseConnectionManager` | `Server/Sse/` (shared, already registered) |
| `IRazorPartialRenderer` | `Server/Services/RazorPartialRenderer.cs` (for Phase 5) |
| `KingMoveValidator` | `Server/King/KingMoveValidator.cs` (used by engine internally) |

## Key Design Decisions

1. **No 2-second trick delay**: The endpoint completes tricks immediately. The delay was a UI nicety in the hub; Phase 5 can handle timing via SSE or CSS animation.

2. **Dual broadcasting in KingEventBroadcaster**: Engine-internal events (TrickWon, RoundEnded) must reach SSE clients. The broadcaster sends to both SignalR (old UI) and SSE (new UI). Event log HTML is rendered inline (no Razor needed).

3. **Placeholder HTML in KingViewRenderer**: Phase 5 replaces placeholders with real Razor partials. Phase 4 only needs curl-testable responses.

4. **Shared SseConnectionManager**: Both Bon and King use the same SSE connection manager. A player can only have one SSE connection at a time (acceptable — nobody plays both simultaneously).

5. **Card parsing in play-card endpoint**: Form data sends `cardRank` and `cardSuit` strings. The endpoint parses these into a `Card` object. The Card record constructor is `Card(string Rank, string Suit)`.

6. **Trump suit parsing in select-trump endpoint**: Form data sends `trumpSuit` string. Parse with `Enum.TryParse<Suit>()`.

---

## Verification

1. `dotnet build -c Release` — 0 errors, 0 warnings
2. Curl tests for each endpoint:
   - `POST /king/create` with playerName → returns HTML, creates match
   - `POST /king/join` with matchId + playerName → returns HTML, 4-player max enforced
   - `POST /king/reconnect` with matchId → returns HTML, marks connected
   - `POST /king/start-round` with matchId → returns HTML, requires 4 players
   - `POST /king/select-trump` with matchId + trumpSuit → returns HTML
   - `POST /king/play-card` with matchId + cardRank + cardSuit → returns HTML
   - `POST /king/end-round` with matchId → returns HTML, creator-only
   - Error cases: missing cookie, invalid match ID, non-creator, wrong phase
3. SSE: `curl -N http://127.0.0.1:44999/king/sse?matchId=...&playerId=...` — receives `connected` event, receives `state-update` and `game-event` when actions happen
4. Old King frontend at `/king/` still works via SignalR
5. Update `specs/bon-v001-03-migration-progress.md` — mark Phase 4 items complete
