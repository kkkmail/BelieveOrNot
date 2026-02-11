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

_(To be written when Phase 2 is implemented)_

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
