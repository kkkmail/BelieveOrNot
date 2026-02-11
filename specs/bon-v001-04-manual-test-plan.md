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
| 1 | Create match | `curl -v -X POST http://127.0.0.1:44999/bon/create -d "playerName=Alice&deckSize=Full&jokerCount=0" -b "PlayerId={your-guid}"` | 200 OK with HTML comment containing `state-update for player {guid}` |
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

_(To be written when Phase 3 is implemented)_

---

## Phase 4 — King Endpoints

_(To be written when Phase 4 is implemented)_

---

## Phase 5 — King UI

_(To be written when Phase 5 is implemented)_

---

## Phase 6 — Switchover & Cleanup

_(To be written when Phase 6 is implemented)_
