# Migration Progress Tracker

**Spec**: `bon-v001-02-migration.md`
**Started**: 2026-02-10
**Last updated**: 2026-02-11

---

## Phase 1 — Foundation (COMPLETE)
- [x] Enable Razor Pages in Program.cs
- [x] Create Pages/ folder structure
- [x] Add htmx (vendored: htmx 2.0.8, SSE ext 2.2.4 in wwwroot/lib/htmx/)
- [x] Player ID via server-set cookie (HttpOnly, 365-day MaxAge)
- [x] Create interaction.js (server-driven constraint enforcement)
- [x] Build SSE infrastructure (SseConnectionManager, SseBroadcaster in Server/Sse/)
- [x] GET /bon/sse endpoint registered in Program.cs
- [x] Create site.css with layout primitives (.row, .stack, .grid)
- [x] Scaffold test page at /bon
- [x] Build succeeds (0 warnings, 0 errors)

## Phase 2 — BelieveOrNot Endpoints (COMPLETE)
- [x] POST /bon/create
- [x] POST /bon/join
- [x] POST /bon/reconnect
- [x] POST /bon/start-round
- [x] POST /bon/play
- [x] POST /bon/challenge
- [x] POST /bon/end-round
- [x] POST /bon/end-game
- [x] POST /bon/message
- [x] POST /bon/check-match
- [x] BonViewRenderer service (placeholder HTML, Phase 3 renders actual Razor)
- [x] RazorPartialRenderer service (generic partial-to-string renderer)
- [x] Connection tracking via SseConnectionManager
- [x] SSE disconnect handling (marks player disconnected, notifies others)
- [x] Idempotency for play/challenge via ProcessedCommands
- [x] PlayerId from HttpOnly cookie (not form data)
- [x] Build succeeds (0 errors)

## Phase 3 — BelieveOrNot UI (COMPLETE)
- [x] BonViewModel wrapper with computed properties (IsCreator, IsYourTurn, CanPlay, CanChallenge)
- [x] _ViewImports updated with game namespaces
- [x] Index.cshtml page with setup forms and all region placeholders
- [x] _SseContainer partial (SSE connection setup via OOB swap)
- [x] _SetupForm partial (match ID display after joining)
- [x] _ConnectionStatus partial
- [x] _GameStatus partial (phase, round, turn, rank, pile)
- [x] _Players partial (player cards with stats, turn indicator, badges)
- [x] _Hand partial (checkbox card selection with data-* constraints)
- [x] _Actions partial (play button, rank selector, challenge button, hx-include wiring)
- [x] _PreviousPlay partial (face-down cards with radio selection for challenge)
- [x] _CardPile partial
- [x] _Scores partial (sorted score table)
- [x] _EventLog partial (SSE prepends via afterbegin OOB)
- [x] _GameManagement partial (start/end round/game, creator-only, hx-confirm)
- [x] _FinalResults partial (game over overlay with final scores)
- [x] _Help partial (collapsible game rules)
- [x] BonViewRenderer renders all Razor partials (with fallback logging)
- [x] site.css updated with full game styles (cards, players, actions, scores, events)
- [x] Build succeeds (0 warnings, 0 errors)
- [x] All endpoints return correct HTML (curl-tested: create, join, start-round, play, challenge, end-round, end-game, message, check-match)
- [x] Error cases verified (missing cookie, bad IDs, non-creator, etc.)
- [x] Old frontend at / still works
- [ ] Full browser testing with htmx (SSE push, OOB swaps, interaction.js)

## Phase 4 — King Endpoints
- [ ] POST /king/create
- [ ] POST /king/join
- [ ] POST /king/reconnect
- [ ] POST /king/start-round
- [ ] POST /king/play-card
- [ ] POST /king/select-trump
- [ ] POST /king/end-round
- [ ] GET /king/sse
- [ ] KingViewRenderer service

## Phase 5 — King UI
- [ ] _KingSetupForm partial
- [ ] _KingGameStatus partial
- [ ] _KingPlayers partial
- [ ] _KingTrick partial
- [ ] _KingHand partial (radio button card selection)
- [ ] _KingActions partial
- [ ] _KingTrumpSelect partial
- [ ] _KingRoundInfo partial
- [ ] _KingScores partial
- [ ] _KingEventLog partial
- [ ] _KingManagement partial
- [ ] _KingTrumpDisplay partial
- [ ] Full game playable at /king

## Phase 6 — Switchover & Cleanup
- [ ] Remap root URL to /bon
- [ ] Delete old JS files (wwwroot/js/, king/js/)
- [ ] Delete old CSS files (wwwroot/styles/, king/styles/)
- [ ] Delete old HTML files
- [ ] Delete GameHub and KingHub files
- [ ] Remove SignalR NuGet package
- [ ] Clean up Program.cs

---

## Decisions & Notes

- **Player ID**: Server-set HttpOnly cookie (not localStorage). Persistent for 365 days.
- **htmx**: Vendored locally (not CDN) at wwwroot/lib/htmx/ — htmx 2.0.8, SSE extension 2.2.4.
- **HTTPS/HTTP2**: Deferred. Development uses HTTP/1.1. SSE connection limit (6/domain) acceptable for dev since each browser only needs 1 SSE connection per game tab.
- **Git branch**: Working on `ai-htmx`.
- **Commits**: User commits manually after review. LLM does not commit.
