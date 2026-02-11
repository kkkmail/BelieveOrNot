# Migration Progress Tracker

**Spec**: `bon-v001-02-migration.md`
**Started**: 2026-02-10
**Last updated**: 2026-02-10

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

## Phase 2 — BelieveOrNot Endpoints
- [ ] POST /bon/create
- [ ] POST /bon/join
- [ ] POST /bon/reconnect
- [ ] POST /bon/start-round
- [ ] POST /bon/play
- [ ] POST /bon/challenge
- [ ] POST /bon/end-round
- [ ] POST /bon/end-game
- [ ] POST /bon/message
- [ ] BonViewRenderer service
- [ ] Connection tracking via SseConnectionManager

## Phase 3 — BelieveOrNot UI
- [ ] _SetupForm partial
- [ ] _GameStatus partial
- [ ] _Players partial
- [ ] _Hand partial (with checkbox card selection)
- [ ] _Actions partial (play button, rank selector, challenge confirm)
- [ ] _PreviousPlay partial
- [ ] _CardPile partial
- [ ] _Scores partial
- [ ] _EventLog partial
- [ ] _GameManagement partial
- [ ] _FinalResults partial
- [ ] _ConnectionStatus partial
- [ ] _Help partial
- [ ] Full game playable at /bon

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
