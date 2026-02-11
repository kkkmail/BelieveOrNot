# Migration Progress Tracker

**Spec**: `bon-v001-02-migration.md`
**Started**: not yet
**Last updated**: not yet

---

## Phase 1 — Foundation
- [ ] Enable Razor Pages in Program.cs
- [ ] Create Pages/ folder structure
- [ ] Add htmx (CDN or vendored)
- [ ] Player ID via server-set cookie
- [ ] Create interaction.js (server-driven constraint enforcement)
- [ ] Build SSE infrastructure (SseConnectionManager, SseBroadcaster)
- [ ] Create site.css with layout primitives
- [ ] Scaffold test page at /bon

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
- [ ] GET /bon/sse (SSE connection endpoint)
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

(Record any decisions or issues encountered during migration here)
