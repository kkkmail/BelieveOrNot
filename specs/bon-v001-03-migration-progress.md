# Migration Progress Tracker

**Spec**: `bon-v001-02-migration.md`
**Started**: 2026-02-10
**Last updated**: 2026-02-12 (Phase 6 complete)

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
- [x] Full browser testing with htmx (SSE push, OOB swaps, interaction.js)
- [x] UI fixes documented in `bon-v001-04-phase3-browser-testing.md`

## Phase 4 — King Endpoints (COMPLETE)
- [x] POST /king/create
- [x] POST /king/join
- [x] POST /king/reconnect
- [x] POST /king/start-round
- [x] POST /king/play-card
- [x] POST /king/select-trump
- [x] POST /king/end-round
- [x] GET /king/sse
- [x] KingViewRenderer service (placeholder HTML, Phase 5 renders actual Razor)
- [x] KingEventBroadcaster dual-broadcast (SignalR + SSE)
- [x] IKingViewRenderer registered as scoped service
- [x] Build succeeds (0 warnings, 0 errors)

## Phase 5 — King UI (COMPLETE)
- [x] KingViewModel wrapper with computed properties (IsCreator, IsYourTurn, CanPlay, CanSelectTrump, SelectableSuits)
- [x] _ViewImports updated with King namespace
- [x] King/Index.cshtml page with setup forms and all region placeholders
- [x] _SseContainer partial (SSE connection for King)
- [x] _ConnectionStatus partial
- [x] _SetupForm partial (hides form after create/join)
- [x] _GameStatus partial (phase, round, round name, turn, tricks, match ID)
- [x] _Players partial (4 player cards with stats, tricks won, turn indicator)
- [x] _TrumpDisplay partial (trump suit indicator bar)
- [x] _Trick partial (4 card slots in cross layout)
- [x] _Hand partial (radio button single-select, suit filtering via data-selectable-suits)
- [x] _Actions partial (play button, waiting messages, phase-aware)
- [x] _TrumpSelect partial (4 suit buttons for collecting rounds)
- [x] _RoundInfo partial (round name, description, special rules)
- [x] _Scores partial (score table with tricks won)
- [x] _EventLog partial (SSE-populated)
- [x] _Management partial (start round button, creator-only, 4 players required)
- [x] _ManagementControls partial (end round button, creator-only)
- [x] _FinalResults partial (game over overlay)
- [x] KingViewRenderer renders all Razor partials (mirrors BonViewRenderer)
- [x] interaction.js updated with King card selection and play button handlers
- [x] site.css updated with King-specific styles (trick cross layout, trump display, trump selection, round info)
- [x] Build succeeds (0 warnings, 0 errors)

## Phase 6 — Switchover & Cleanup (COMPLETE)
- [x] Delete old JS files (wwwroot/js/, king/js/) — 71 + 37 modules removed
- [x] Delete old CSS files (wwwroot/styles/, king/styles/) — 29 + 5 files removed
- [x] Delete old HTML files — 9 files removed (index.html, game-board.html, help.html, setup-form.html, other-games.html, king/*.html)
- [x] Delete GameHub and KingHub files — 10 + 11 hub files removed
- [x] Remove SignalR NuGet package from .csproj
- [x] Remove SignalR global using from !_GlobalUsings.cs
- [x] Remove IHubContext from KingEventBroadcaster (SSE-only now)
- [x] Clean up Program.cs — removed AddSignalR, UseDefaultFiles, MapHub, old check-match endpoint, King static file provider
- [x] Create game selector landing page at / (Pages/Index.cshtml)
- [x] Build succeeds (0 warnings, 0 errors)

---

## Decisions & Notes

- **Player ID**: Server-set HttpOnly cookie (not localStorage). Persistent for 365 days.
- **htmx**: Vendored locally (not CDN) at wwwroot/lib/htmx/ — htmx 2.0.8, SSE extension 2.2.4.
- **HTTPS/HTTP2**: Deferred. Development uses HTTP/1.1. SSE connection limit (6/domain) acceptable for dev since each browser only needs 1 SSE connection per game tab.
- **Git branch**: Working on `ai-htmx`.
- **Commits**: User commits manually after review. LLM does not commit.
