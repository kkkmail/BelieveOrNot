# BelieveOrNot — Manual Test Plan

This document defines manual verification steps for each migration phase.

Build, then run the EXE directly (Kestrel).

Base URL: `http://127.0.0.1:44999`

---

## Phase 1 — Foundation

| # | Test | URL | Expected Result |
|---|---|---|---|
| 1 | Old frontend still works | `/` | Existing BelieveOrNot game loads and is fully functional |
| 2 | New test page renders | `/bon` | Shows "Believe Or Not" heading, foundation message, and a Player ID GUID |
| 3 | Player ID cookie persists | `/bon` (refresh) | Same GUID appears after refresh |
| 4 | Player ID unique per browser | `/bon` (incognito or different browser) | Different GUID appears |
| 5 | SSE endpoint connects | `/bon/sse?matchId=00000000-0000-0000-0000-000000000001&playerId=00000000-0000-0000-0000-000000000001` | Shows `event: connected` and `data: ok` as raw text; connection stays open (browser keeps loading) |
| 6 | SSE rejects bad params | `/bon/sse?matchId=bad&playerId=bad` | Returns 400 status |
| 7 | Build succeeds | `dotnet build -c Release` | 0 warnings, 0 errors |

---

## Phase 2 — BelieveOrNot Endpoints

All tests use curl from the command line. The PlayerId cookie must be set. Replace `{matchId}` with the actual match ID from the create response.

**Prerequisites**: Build and run the EXE. Note your PlayerId cookie value from visiting `/bon` in a browser (check browser dev tools → Application → Cookies).

| # | Test | Command | Expected Result |
|---|---|---|---|
| 1 | Create match | `curl -v -X POST http://127.0.0.1:44999/bon/create -d "playerName=Alice&deckSize=Full&jokerCount=0" -b "PlayerId={your-guid}"` | 200 OK with HTML containing `sse-container`, `game-setup`, `players-area` with Alice |
| 2 | Create rejects missing name | `curl -v -X POST http://127.0.0.1:44999/bon/create -d "" -b "PlayerId={guid}"` | 400 Bad Request |
| 3 | Create rejects missing cookie | `curl -v -X POST http://127.0.0.1:44999/bon/create -d "playerName=Alice"` | 400 "Missing PlayerId cookie" |
| 4 | Join match | `curl -v -X POST http://127.0.0.1:44999/bon/join -d "matchId={matchId}&playerName=Bob" -b "PlayerId={different-guid}"` | 200 OK with HTML comment |
| 5 | Join rejects bad match ID | `curl -v -X POST http://127.0.0.1:44999/bon/join -d "matchId=bad&playerName=Bob" -b "PlayerId={guid}"` | 400 "Invalid match ID" |
| 6 | Join rejects nonexistent match | `curl -v -X POST http://127.0.0.1:44999/bon/join -d "matchId=00000000-0000-0000-0000-000000000099&playerName=Bob" -b "PlayerId={guid}"` | 404 "Match not found" |
| 7 | Start round (creator only) | `curl -v -X POST http://127.0.0.1:44999/bon/start-round -d "matchId={matchId}" -b "PlayerId={creator-guid}"` | 200 OK with HTML comment showing `phase=InProgress` |
| 8 | Start round rejects non-creator | `curl -v -X POST http://127.0.0.1:44999/bon/start-round -d "matchId={matchId}" -b "PlayerId={non-creator-guid}"` | 400 "Only the match creator can start the round" |
| 9 | End round (creator only) | `curl -v -X POST http://127.0.0.1:44999/bon/end-round -d "matchId={matchId}" -b "PlayerId={creator-guid}"` | 200 OK with HTML comment showing `phase=WaitingForPlayers` |
| 10 | End game | `curl -v -X POST http://127.0.0.1:44999/bon/end-game -d "matchId={matchId}" -b "PlayerId={creator-guid}"` | 200 OK with HTML comment |
| 11 | Check match exists | `curl -v -X POST http://127.0.0.1:44999/bon/check-match -H "Content-Type: application/json" -d '{"matchId":"{matchId}"}'` | `{"exists":true}` |
| 12 | Check match doesn't exist | `curl -v -X POST http://127.0.0.1:44999/bon/check-match -H "Content-Type: application/json" -d '{"matchId":"00000000-0000-0000-0000-000000000099"}'` | `{"exists":false}` |
| 13 | SSE receives events | Connect SSE in one terminal, then create/join in another | SSE stream shows `event: game-event` and `event: state-update` lines |
| 14 | Old frontend still works | `/` | Existing BelieveOrNot game loads and is fully functional |
| 15 | Build succeeds | `dotnet build -c Release` | 0 errors |

---

## Phase 3 — BelieveOrNot UI

**Browser testing**: Open `/bon` in two browsers (or one regular + one incognito). Each gets a unique PlayerId cookie.

| # | Test | Steps | Expected Result |
|---|---|---|---|
| 1 | Page loads | Visit `/bon` | Shows "Believe Or Not" heading, Create/Join/Reconnect forms |
| 2 | Create game | Fill name + settings, click "Create Game" | Setup form replaced with Match ID display; game status shows "WaitingForPlayers"; player list shows creator with (you) and host badges; "Start Round" button visible |
| 3 | Join game (2nd browser) | Copy Match ID, fill name, click "Join Game" | Both browsers show updated player list with 2 players; SSE pushes update the creator's browser |
| 4 | SSE connection | After create/join, check browser Network tab | SSE connection open at `/bon/sse`; `event: connected` received |
| 5 | Start round | Creator clicks "Start Round" | Phase changes to InProgress; cards dealt; hand shows clickable cards; turn indicator on current player; pile count shows; rank/play controls visible for active player |
| 6 | Card selection | Click cards in hand | Cards visually raise/highlight; selection counter updates; max selection enforced by interaction.js |
| 7 | Play cards | Select cards, choose rank (if opening), click "Play Cards" | Hand updated (played cards removed); pile count increases; turn moves to next player; event log shows play event |
| 8 | Challenge | On your turn when previous play exists, select a face-down card, click "Challenge" | Challenge result shown in event log; cards collected by loser; pile resets |
| 9 | End round | Creator clicks "End Round" | Phase returns to WaitingForPlayers; hands cleared; "Start Round" button reappears |
| 10 | End game | Creator clicks "End Game" | Game Over overlay shows with final scores |
| 11 | Scores update | Play multiple rounds | Score table reflects accumulated scores |
| 12 | Reconnect | Refresh page, paste Match ID, click "Reconnect" | Player rejoins; game state restored; hand visible if round in progress |
| 13 | Build succeeds | `dotnet build -c Release` | 0 errors |

---

## Phase 4 — King Endpoints

_(To be written when Phase 4 is implemented)_

---

## Phase 5 — King UI

_(To be written when Phase 5 is implemented)_

---

## Phase 6 — Switchover & Cleanup

_(To be written when Phase 6 is implemented)_
